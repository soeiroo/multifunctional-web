"use client";

import { useState, useRef, useCallback, useEffect, type MutableRefObject } from "react";
import ReactPlayer from "react-player/lazy";

interface VideoPlayerProps {
  url: string;
  onEnded?: () => void;
  roomId?: string | null;
  onSyncPlay?: () => void;
  onSyncPause?: () => void;
  onSyncSeek?: (played: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoCallbacks?: MutableRefObject<any>;
}

export function VideoPlayer({ url, onEnded, roomId, onSyncPlay, onSyncPause, onSyncSeek, videoCallbacks }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    setReady(false);
    setPlayed(0);
    setLoaded(0);
    setDuration(0);
    setPlaying(true);
  }, [url]);

  // Register sync callbacks for room video events
  const isSyncing = useRef(false); // Prevent feedback loops
  useEffect(() => {
    if (!videoCallbacks?.current || !roomId) return;
    videoCallbacks.current.onPlay = () => { isSyncing.current = true; setPlaying(true); isSyncing.current = false; };
    videoCallbacks.current.onPause = () => { isSyncing.current = true; setPlaying(false); isSyncing.current = false; };
    videoCallbacks.current.onSeek = (p: number) => {
      isSyncing.current = true;
      setPlayed(p);
      playerRef.current?.seekTo(p);
      isSyncing.current = false;
    };
  }, [roomId, videoCallbacks]);

  // Sync-aware play/pause handler
  const handlePlayPause = useCallback(() => {
    const next = !playing;
    setPlaying(next);
    if (!isSyncing.current) {
      if (next) onSyncPlay?.();
      else onSyncPause?.();
    }
  }, [playing, onSyncPlay, onSyncPause]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [playing, resetHideTimer]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };
  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    const val = parseFloat((e.target as HTMLInputElement).value);
    playerRef.current?.seekTo(val);
    if (!isSyncing.current) onSyncSeek?.(val);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden group"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetHideTimer}
    >
      {/* React Player — only render client-side */}
      {mounted && (
        <div className="absolute inset-0">
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            volume={volume}
            muted={muted}
            width="100%"
            height="100%"
            onReady={() => setReady(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={onEnded}
            onProgress={({ played: p, loaded: l }) => {
              if (!seeking) { setPlayed(p); setLoaded(l); }
            }}
            onDuration={(d) => setDuration(d)}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  controls: 0,
                  showinfo: 0,
                },
              },
            }}
          />
        </div>
      )}

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f1219] z-10">
          <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Click to play/pause */}
      <div
        className="absolute inset-0 z-20"
        onClick={() => { if (ready) handlePlayPause(); }}
      />

      {/* Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 z-30 pointer-events-none ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="relative px-4 pb-4 space-y-2 pointer-events-auto">
          {/* Seek bar */}
          <div className="relative h-1.5 group/seek">
            <div className="absolute top-0 left-0 h-full bg-white/20 rounded-full" style={{ width: `${loaded * 100}%` }} />
            <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${played * 100}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{ left: `calc(${played * 100}% - 7px)` }}
            />
            <input
              type="range" min={0} max={0.999999} step="any" value={played}
              onMouseDown={handleSeekMouseDown} onChange={handleSeekChange} onMouseUp={handleSeekMouseUp}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-3 text-white">
            <button onClick={handlePlayPause} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
              )}
            </button>
            <span className="text-xs font-mono text-slate-300 min-w-[90px]">{formatTime(duration * played)} / {formatTime(duration)}</span>
            <div className="flex-1" />

            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={() => setMuted(!muted)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                {muted || volume === 0 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                )}
              </button>
              <input
                type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-blue-500 h-1 cursor-pointer"
              />
            </div>

            <button onClick={toggleFullscreen} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              {isFullscreen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Big play button */}
      {!playing && ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 bg-blue-500/90 rounded-full flex items-center justify-center shadow-2xl">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
          </div>
        </div>
      )}
    </div>
  );
}
