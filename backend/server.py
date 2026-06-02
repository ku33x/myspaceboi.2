from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hashlib
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


# ---------------- Unique visitor tracking ----------------
class VisitIn(BaseModel):
    visitor_id: str


class VisitOut(BaseModel):
    count: int
    new: bool


def _client_fingerprint(request: Request) -> str:
    """Build a server-side fingerprint from IP + User-Agent.
    Acts as a fallback dedupe key when localStorage is cleared / incognito."""
    xff = request.headers.get("x-forwarded-for", "")
    ip = xff.split(",")[0].strip() if xff else (request.client.host if request.client else "")
    ua = request.headers.get("user-agent", "")
    raw = f"{ip}|{ua}"
    return "fp:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]


@api_router.post("/views/visit", response_model=VisitOut)
async def track_visit(payload: VisitIn, request: Request):
    """Record a unique visitor. Dedupes by BOTH:
      1. Client-supplied visitor_id (localStorage UUID) — persists across refreshes
      2. Server-derived fingerprint (ip + user-agent hash) — catches incognito / cleared storage
    A visitor is only counted ONCE; subsequent visits never bump the counter.
    """
    vid = (payload.visitor_id or "").strip()[:128]
    fp = _client_fingerprint(request)

    # Check if EITHER key is already known (as primary _id OR as alias)
    keys_to_check = [k for k in (vid, fp) if k]
    existing = None
    if keys_to_check:
        existing = await db.unique_visitors.find_one({
            "$or": [
                {"_id": {"$in": keys_to_check}},
                {"aliases": {"$in": keys_to_check}},
            ]
        })

    is_new = False
    now_iso = datetime.now(timezone.utc).isoformat()

    if existing:
        # Returning visitor: just update last_seen, never bump count
        await db.unique_visitors.update_one(
            {"_id": existing["_id"]},
            {"$set": {"last_seen": now_iso},
             "$addToSet": {"aliases": {"$each": [k for k in (vid, fp) if k and k != existing["_id"]]}}},
        )
    else:
        # Brand-new visitor → count once
        primary_key = vid or fp
        try:
            await db.unique_visitors.insert_one({
                "_id": primary_key,
                "first_seen": now_iso,
                "last_seen": now_iso,
                "aliases": [k for k in (vid, fp) if k and k != primary_key],
            })
            is_new = True
        except Exception:
            # Race condition — another request already inserted with same id; treat as returning
            is_new = False

    total = await db.unique_visitors.count_documents({})
    return VisitOut(count=total, new=is_new)


@api_router.get("/views", response_model=VisitOut)
async def get_views():
    total = await db.unique_visitors.count_documents({})
    return VisitOut(count=total, new=False)


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()