import { useEffect, useRef, useState } from "react";
import { Eye, Volume2, VolumeX } from "lucide-react";

const DISCORD_USER_ID = "651336986019495937";
const VIDEO_URL =
  "https://customer-assets.emergentagent.com/job_bio-page-5/artifacts/xckchlkl_videoplayback.mp4";
const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

const SOCIALS = [
  {
    name: "Discord",
    slug: "discord",
    href: "https://discordapp.com/users/651336986019495937",
  },
  {
    name: "Roblox",
    slug: "roblox",
    href: "https://www.roblox.com/users/1218134282/profile",
  },
  {
    name: "Steam",
    slug: "steam",
    href: "https://steamcommunity.com/id/darklorddan",
  },
  {
    name: "TikTok",
    slug: "tiktok",
    href: "https://www.tiktok.com/@ku33x?lang=en",
  },
];

const ACTIVITY_TYPES = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  4: "",
  5: "Competing in",
};

const STATUS_COLOR = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#80848e",
};

const DEFAULT_AVATAR =
  "https://cdn.discordapp.com/embed/avatars/0.png";

function buildAvatarUrl(userId, avatarHash) {
  if (!avatarHash) return DEFAULT_AVATAR;
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=512`;
}

function pickPrimaryActivity(activities = []) {
  // Prefer Spotify, then non-custom, then custom
  const spotify = activities.find((a) => a.id === "spotify:1" || a.name === "Spotify");
  if (spotify) return spotify;
  const nonCustom = activities.find((a) => a.type !== 4);
  if (nonCustom) return nonCustom;
  return activities.find((a) => a.type === 4) || null;
}

function formatActivity(activity) {
  if (!activity) return null;
  if (activity.type === 4) {
    // Custom status
    const emoji = activity.emoji?.name || "";
    return {
      prefix: "",
      title: activity.state || activity.name || "",
      emoji,
    };
  }
  const prefix = ACTIVITY_TYPES[activity.type] ?? "Playing";
  return {
    prefix,
    title: activity.name,
    detail: activity.details,
    state: activity.state,
  };
}

const BioLink = () => {
  const [lanyard, setLanyard] = useState(null);
  const [error, setError] = useState(null);
  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [views, setViews] = useState(0);
  const videoRef = useRef(null);

  // Fetch Lanyard data
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`,
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          setLanyard(json.data);
          setError(null);
        } else {
          setError(json.error?.message || "User Not found");
        }
      } catch {
        if (!cancelled) setError("Could not reach Discord");
      }
    };
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Bump view counter once per unique visitor using backend
  useEffect(() => {
    let visitorId = localStorage.getItem("kurx_visitor_id");
    if (!visitorId) {
      visitorId =
        (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("kurx_visitor_id", visitorId);
    }
    fetch(`${API_BASE}/api/views/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: visitorId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setViews(d.count);
      })
      .catch(() => {
        // Fallback: just fetch the public count
        fetch(`${API_BASE}/api/views`)
          .then((r) => r.json())
          .then((d) => {
            if (typeof d.count === "number") setViews(d.count);
          })
          .catch(() => {});
      });
  }, []);

  const toggleMute = async () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    try {
      await v.play();
    } catch {
      /* ignored */
    }
  };

  const username = lanyard?.discord_user?.username || "kurx";
  const avatarUrl = lanyard
    ? buildAvatarUrl(lanyard.discord_user.id, lanyard.discord_user.avatar)
    : DEFAULT_AVATAR;
  const status = lanyard?.discord_status || "offline";
  const activity = pickPrimaryActivity(lanyard?.activities || []);
  const activityInfo = formatActivity(activity);

  return (
    <div
      data-testid="biolink-root"
      className="relative min-h-screen w-full overflow-hidden bg-[#050505] text-white"
      style={{ fontFamily: '"Outfit", "Inter", system-ui, sans-serif' }}
    >
      {/* Background video */}
      <video
        ref={videoRef}
        data-testid="bg-video"
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoReady(true)}
        style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.8s ease" }}
      />

      {/* Overlay layers for cinematic look */}
      <div className="pointer-events-none absolute inset-0 halftone-overlay" />
      <div className="pointer-events-none absolute inset-0 scanlines-overlay opacity-60" />
      <div className="pointer-events-none absolute inset-0 vignette-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-black/30" />

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Avatar */}
        <div className="float-in delay-1 relative">
          <div
            data-testid="avatar-wrapper"
            className="avatar-ring h-[140px] w-[140px] overflow-hidden rounded-full bg-zinc-800"
          >
            <img
              data-testid="avatar-img"
              src={avatarUrl}
              alt={`${username} avatar`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
          </div>
          {/* Discord status dot */}
          <span
            data-testid="status-dot"
            className="status-dot absolute bottom-2 right-2 inline-block h-5 w-5 rounded-full ring-4 ring-black/60"
            style={{ backgroundColor: STATUS_COLOR[status] || STATUS_COLOR.offline }}
            title={status}
          />
        </div>

        {/* Username */}
        <h1
          data-testid="username"
          className="float-in delay-2 username-glow mt-6 text-5xl font-semibold tracking-tight md:text-6xl"
        >
          {username}
        </h1>

        {/* Status card */}
        <div
          data-testid="status-card"
          className="float-in delay-3 glass-card mt-8 w-[min(440px,90vw)] rounded-2xl px-6 py-4"
        >
          {error || !lanyard ? (
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 text-base font-medium">
                <span className="text-red-500 text-lg">✗</span>
                <span data-testid="status-text">User Not found</span>
              </div>
              <p className="text-xs text-zinc-400">
                Join{" "}
                <a
                  href="https://discord.gg/lanyard"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white"
                >
                  discord.gg/lanyard
                </a>{" "}
                so I can display my Discord status.
              </p>
            </div>
          ) : activityInfo ? (
            <div className="flex items-start gap-3">
              {activity?.type === 2 && activity?.assets?.large_image ? (
                <img
                  alt="album art"
                  src={
                    activity.assets.large_image.startsWith("spotify:")
                      ? `https://i.scdn.co/image/${activity.assets.large_image.replace("spotify:", "")}`
                      : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`
                  }
                  className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                />
              ) : (
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[status] }}
                />
              )}
              <div className="flex flex-col text-left">
                <span className="text-[11px] uppercase tracking-widest text-zinc-400">
                  {activityInfo.prefix || "Status"}
                </span>
                <span
                  data-testid="activity-title"
                  className="text-base font-medium leading-tight text-white"
                >
                  {activityInfo.emoji ? `${activityInfo.emoji} ` : ""}
                  {activityInfo.title || "—"}
                </span>
                {activityInfo.detail && (
                  <span className="text-xs text-zinc-300">{activityInfo.detail}</span>
                )}
                {activityInfo.state && activityInfo.state !== activityInfo.title && (
                  <span className="text-xs text-zinc-400">{activityInfo.state}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[status] }}
              />
              <span data-testid="status-text" className="text-sm capitalize text-zinc-200">
                {status === "dnd" ? "Do Not Disturb" : status}
              </span>
            </div>
          )}
        </div>

        {/* Social icons */}
        <div
          data-testid="socials"
          className="float-in delay-4 mt-10 flex items-center gap-7"
        >
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              data-testid={`social-${s.name.toLowerCase()}`}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.name}
              className="social-icon-btn block h-7 w-7"
            >
              <img
                src={`https://cdn.simpleicons.org/${s.slug}/ffffff`}
                alt={s.name}
                className="h-full w-full"
                draggable="false"
              />
            </a>
          ))}
        </div>
      </main>

      {/* View counter */}
      <div
        data-testid="view-counter"
        className="float-in delay-5 absolute bottom-5 left-5 z-10 flex items-center gap-1.5 text-sm text-zinc-300/90"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
      >
        <Eye size={16} strokeWidth={1.75} />
        <span>{views}</span>
      </div>

      {/* Mute toggle */}
      <button
        data-testid="mute-toggle"
        onClick={toggleMute}
        aria-label={muted ? "Unmute background music" : "Mute background music"}
        className="unmute-btn fixed top-5 right-5 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-200 backdrop-blur"
      >
        {muted ? (
          <>
            <VolumeX size={14} />
            <span>tap for sound</span>
          </>
        ) : (
          <>
            <Volume2 size={14} />
            <span>sound on</span>
          </>
        )}
      </button>
    </div>
  );
};

export default BioLink;
