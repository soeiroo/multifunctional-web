"use client";

import { useState, useCallback } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

// Video type icons
const TYPE_ICONS: Record<string, string> = {
  youtube: "🎬",
  vimeo: "🎥",
  twitch: "🟣",
  dailymotion: "📺",
  soundcloud: "🎵",
  direct: "🔗",
  unknown: "🌐",
};

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [resolvedType, setResolvedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!url.trim()) return;
    setError(null);
    setResolvedType(null);

    try {
      const res = await fetch("/api/video/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!data.valid) {
        setError(data.error || "URL inválida");
        return;
      }

      setResolvedType(data.type);
      onSubmit(url.trim());
    } catch {
      setError("Erro ao processar URL");
    }
  }, [url, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Paste detection
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted && pasted.startsWith("http")) {
      setTimeout(() => {
        setUrl(pasted);
        // Auto-submit on paste
        onSubmit(pasted.trim());
      }, 50);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Type icon */}
        {resolvedType && (
          <div className="w-11 h-11 bg-[#1a1f2e] rounded-lg flex items-center justify-center text-lg shrink-0 border border-white/5">
            {TYPE_ICONS[resolvedType] || TYPE_ICONS.unknown}
          </div>
        )}

        {/* Input */}
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Cole a URL do vídeo aqui..."
            className="w-full h-11 bg-[#1a1f2e] text-slate-200 placeholder-slate-500 px-4 rounded-lg border border-white/5 focus:border-blue-500/50 focus:outline-none transition-colors text-sm"
          />
          {url && (
            <button
              onClick={() => { setUrl(""); setResolvedType(null); setError(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!url.trim() || isLoading}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-all shrink-0 active:scale-95"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Reproduzir"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs pl-1">{error}</p>
      )}

      {/* Supported platforms hint */}
      <p className="text-slate-600 text-xs pl-1">
        YouTube, Vimeo, Twitch, Dailymotion, SoundCloud, arquivos .mp4 e mais
      </p>
    </div>
  );
}
