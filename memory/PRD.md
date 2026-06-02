# kurx — Biolink Page

## Original Problem Statement
"could you make me a biolink like this but remove the background" (reference screenshot of a dark-themed biolink with avatar, name, Discord status, socials). User requested:
- Username: kurx
- Profile pic + status pulled live from Discord (user id 651336986019495937)
- Socials: Roblox, Discord, Steam, TikTok
- Status text = live Discord activity/presence
- Solid dark background but with a music video playing behind everything (mp4 provided)

## Architecture
- Frontend: React 19 + Tailwind, single page at `/` rendered by `src/components/BioLink.jsx`
- Live Discord data: Lanyard public REST API (`https://api.lanyard.rest/v1/users/{id}`), polled every 15s. No backend needed.
- Background: HTML5 `<video>` autoplay/muted/loop with cinematic halftone + scanlines + vignette overlays
- Audio: Tap-to-unmute pill (browser autoplay-with-sound policy)

## Implemented (2026-06-02)
- Avatar from Discord CDN (animated GIF support), online/idle/dnd/offline status dot with pulse
- Live activity card: handles Custom Status, Playing/Streaming/Listening/Watching, Spotify album art
- Roblox / Discord / Steam / TikTok icon row with hover lift
- Music video background + tap-for-sound toggle (top-right)
- View counter in bottom-left (session-based bump)
- "Outfit" Google font, glass-morphism card, staggered float-in entrance animations

## Files
- `/app/frontend/src/App.js`
- `/app/frontend/src/App.css`
- `/app/frontend/src/index.css`
- `/app/frontend/src/components/BioLink.jsx`

## Backlog / Future
- P1: Customizable links via small admin panel
- P2: Spotify "now playing" progress bar
- P2: Particle/grain shader instead of CSS halftone
- P2: Public share OG image generator
