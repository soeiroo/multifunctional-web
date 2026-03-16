"use client";

import { useState, useEffect } from "react";

interface HistoryItem {
  url: string;
  title: string;
  timestamp: number;
}

const STORAGE_KEY = "video-player-history";
const MAX_HISTORY = 20;

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch { /* ignore */ }
}

export function addToHistory(url: string) {
  const items = loadHistory().filter((i) => i.url !== url);
  // Generate a simple title from URL
  let title = url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube")) {
      const v = u.searchParams.get("v");
      title = `YouTube: ${v || u.pathname}`;
    } else if (u.hostname.includes("vimeo")) {
      title = `Vimeo: ${u.pathname.slice(1)}`;
    } else {
      title = u.hostname + u.pathname;
    }
  } catch { /* keep raw url */ }

  items.unshift({ url, title, timestamp: Date.now() });
  saveHistory(items);
}

interface PlaylistProps {
  currentUrl?: string;
  onSelect: (url: string) => void;
}

export function Playlist({ currentUrl, onSelect }: PlaylistProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, [currentUrl]); // Refresh when video changes

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  const removeItem = (url: string) => {
    const updated = history.filter((i) => i.url !== url);
    saveHistory(updated);
    setHistory(updated);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
      " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 text-sm">
        <p>📋 Seu histórico está vazio</p>
        <p className="text-xs mt-1">Os vídeos reproduzidos aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Histórico</h3>
        <button
          onClick={clearHistory}
          className="text-slate-600 hover:text-red-400 text-xs transition-colors"
        >
          Limpar
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
        {history.map((item) => (
          <div
            key={item.url + item.timestamp}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
              currentUrl === item.url
                ? "bg-blue-500/10 border border-blue-500/20"
                : "hover:bg-white/5 border border-transparent"
            }`}
            onClick={() => onSelect(item.url)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-sm truncate">{item.title}</p>
              <p className="text-slate-600 text-xs">{formatTime(item.timestamp)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeItem(item.url); }}
              className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
