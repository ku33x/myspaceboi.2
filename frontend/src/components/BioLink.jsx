import { useEffect, useRef, useState } from "react";
import { Eye, Volume2, VolumeX, Play } from "lucide-react";

const DISCORD_USER_ID = "651336986019495937";
const VIDEO_URL =
  "https://customer-assets.emergentagent.com/job_bio-page-5/artifacts/xckchlkl_videoplayback.mp4";

const SOCIALS = [
  {
    name: "Discord",
    href: "https://discordapp.com/users/651336986019495937",
    color: "#5865F2",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a14.55 14.55 0 0 0-.658 1.342 18.27 18.27 0 0 0-5.487 0A14.16 14.16 0 0 0 9.748 3 19.74 19.74 0 0 0 5.99 4.37C2.61 9.36 1.696 14.22 2.153 19.01a19.9 19.9 0 0 0 5.997 3.03 14.65 14.65 0 0 0 1.276-2.075 12.86 12.86 0 0 1-2.012-.96c.169-.124.334-.253.493-.385a14.13 14.13 0 0 0 12.186 0c.16.132.325.261.494.385a12.9 12.9 0 0 1-2.014.96 14.7 14.7 0 0 0 1.276 2.075 19.86 19.86 0 0 0 5.998-3.03c.5-5.18-.85-9.99-3.53-14.64ZM9.546 16.044c-1.182 0-2.156-1.075-2.156-2.394 0-1.318.953-2.394 2.156-2.394 1.21 0 2.176 1.083 2.156 2.394 0 1.319-.953 2.394-2.156 2.394Zm4.907 0c-1.181 0-2.156-1.075-2.156-2.394 0-1.318.953-2.394 2.156-2.394 1.211 0 2.177 1.083 2.156 2.394 0 1.319-.945 2.394-2.156 2.394Z" />
      </svg>
    ),
  },
  {
    name: "Roblox",
    href: "https://www.roblox.com/users/1218134282/profile",
    color: "#FFFFFF",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M3.272 2 2 19.728 19.728 22 22 4.272 3.272 2Zm10.124 12.95-4.522-1.156 1.156-4.522 4.522 1.156-1.156 4.522Z" />
      </svg>
    ),
  },
  {
    name: "Steam",
    href: "https://steamcommunity.com/id/darklorddan",
    color: "#FFFFFF",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.394 3.394 0 0 1 1.913-.59c.063 0 .125.004.186.006l2.866-4.146v-.06a4.535 4.535 0 0 1 4.534-4.532 4.534 4.534 0 0 1 4.532 4.535 4.535 4.535 0 0 1-4.538 4.535h-.105l-4.07 2.91c0 .052.004.105.004.157a3.408 3.408 0 0 1-3.408 3.408c-1.61 0-2.974-1.118-3.31-2.626L.523 15.83C1.972 20.66 6.563 24 11.979 24c6.624 0 11.99-5.367 11.99-12C23.97 5.367 18.603 0 11.979 0M7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375a2.561 2.561 0 0 0 .003-1.961 2.51 2.51 0 0 0-1.378-1.375 2.553 2.553 0 0 0-1.89-.001l1.523.63a1.886 1.886 0 0 1 1.017 2.466 1.89 1.89 0 0 1-2.467 1.018m13.418-8.728a3.022 3.022 0 0 0-3.022-3.022 3.023 3.023 0 0 0-3.024 3.022 3.024 3.024 0 0 0 3.024 3.023 3.023 3.023 0 0 0 3.022-3.023m-5.284-.005a2.268 2.268 0 0 1 2.266-2.265 2.268 2.268 0 0 1 2.265 2.265 2.267 2.267 0 0 1-2.265 2.266 2.268 2.268 0 0 1-2.266-2.266" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@ku33x?lang=en",
    color: "#FFFFFF",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.9a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.33Z" />
      </svg>
    ),
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
  const [views, setViews] = useState(64);
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

  // Bump view counter once per session
  useEffect(() => {
    const seen = sessionStorage.getItem("kurx_viewed");
    if (!seen) {
      sessionStorage.setItem("kurx_viewed", "1");
      setViews((v) => v + 1);
    }
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
          className="float-in delay-2 mt-6 text-5xl font-semibold tracking-tight md:text-6xl"
          style={{ textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}
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
              className="social-icon-btn block h-8 w-8 text-white"
              style={{ color: s.color }}
            >
              {s.svg}
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
            <Play size={14} />
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
