"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { UrlInput } from "@/components/player/UrlInput";
import { Playlist, addToHistory } from "@/components/player/Playlist";
import { Chat } from "@/components/chat/Chat";
import { useSocket } from "@/lib/socket";
import Link from "next/link";

function PlayerContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  const {
    connected,
    players,
    chatMessages,
    videoState,
    videoCallbacks,
    emitVideoUrl,
    emitVideoPlay,
    emitVideoPause,
    emitVideoSeek,
    sendChat,
  } = useSocket(roomId);

  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync received video URL from room
  useEffect(() => {
    if (!roomId) return;
    videoCallbacks.current = {
      onUrl: (url: string) => {
        setCurrentUrl(url);
        addToHistory(url);
      },
      onPlay: () => {/* handled by VideoPlayer sync */},
      onPause: () => {/* handled by VideoPlayer sync */},
      onSeek: () => {/* handled by VideoPlayer sync */},
    };
  }, [roomId, videoCallbacks]);

  // Set initial video from room state
  useEffect(() => {
    if (roomId && videoState.url && !currentUrl) {
      setCurrentUrl(videoState.url);
    }
  }, [roomId, videoState.url, currentUrl]);

  const handlePlayVideo = useCallback((url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    addToHistory(url);
    if (roomId) {
      emitVideoUrl(url);
    }
    setTimeout(() => setIsLoading(false), 500);
  }, [roomId, emitVideoUrl]);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/player?room=${roomId}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="min-h-screen bg-[#0f1219] text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0f1219]/95 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={roomId ? `/room/${roomId}` : "/"}
              className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {roomId ? "Sala" : "Jardim"}
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <h1 className="text-base font-semibold tracking-tight">
              <span className="text-blue-400">▶</span> Player
            </h1>
          </div>

          {/* Room info */}
          {roomId && (
            <div className="flex items-center gap-2">
              <div className="bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
                <span>Sala: {roomId}</span>
                <span className="text-white/20">|</span>
                <span>👥 {players.length + 1}</span>
              </div>
              <button
                onClick={copyRoomLink}
                className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                📋 Copiar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid grid-cols-1 ${roomId ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-[1fr_320px]"} gap-6`}>
          {/* Left: Player + URL Input */}
          <div className="space-y-4">
            {currentUrl ? (
              <VideoPlayer
                url={currentUrl}
                roomId={roomId}
                onSyncPlay={roomId ? emitVideoPlay : undefined}
                onSyncPause={roomId ? emitVideoPause : undefined}
                onSyncSeek={roomId ? emitVideoSeek : undefined}
                videoCallbacks={roomId ? videoCallbacks : undefined}
              />
            ) : (
              <div
                className="w-full bg-[#1a1f2e] rounded-xl border border-white/5 flex flex-col items-center justify-center text-center"
                style={{ aspectRatio: "16/9" }}
              >
                <div className="text-5xl mb-4 opacity-40">🎬</div>
                <p className="text-slate-400 text-sm font-medium mb-1">Nenhum vídeo sendo reproduzido</p>
                <p className="text-slate-600 text-xs max-w-xs">
                  Cole a URL de um vídeo do YouTube, Vimeo, Twitch ou qualquer arquivo de vídeo direto
                </p>
              </div>
            )}

            <div className="bg-[#151922] rounded-xl border border-white/5 p-4">
              <UrlInput onSubmit={handlePlayVideo} isLoading={isLoading} />
            </div>
          </div>

          {/* Right: Chat (if room) or Playlist */}
          <div className="space-y-4">
            {roomId && (
              <div className="h-80 lg:h-[400px]">
                <Chat messages={chatMessages} onSend={sendChat} connected={connected} />
              </div>
            )}
            <div className="bg-[#151922] rounded-xl border border-white/5 p-4">
              <Playlist currentUrl={currentUrl || undefined} onSelect={handlePlayVideo} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1219] flex items-center justify-center text-white">Carregando...</div>}>
      <PlayerContent />
    </Suspense>
  );
}
