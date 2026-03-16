"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/socket";

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  connected: boolean;
}

export function Chat({ messages, onSend, connected }: ChatProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-[#151922] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-slate-300 text-sm font-semibold">💬 Chat</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
        {messages.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-4">Nenhuma mensagem ainda</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`text-xs ${msg.type === "system" ? "text-slate-600 italic text-center py-0.5" : ""}`}>
            {msg.type === "system" ? (
              <span>• {msg.text}</span>
            ) : (
              <div className="py-1">
                <span className="text-blue-400 font-semibold">{msg.name}</span>
                <span className="text-slate-600 ml-1.5">{formatTime(msg.timestamp)}</span>
                <p className="text-slate-300 mt-0.5">{msg.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mensagem..."
            disabled={!connected}
            className="flex-1 h-9 bg-[#1a1f2e] text-slate-200 placeholder-slate-600 px-3 rounded-lg border border-white/5 focus:border-blue-500/50 focus:outline-none text-sm disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!connected || !text.trim()}
            className="h-9 px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 text-white text-sm rounded-lg transition-all"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
