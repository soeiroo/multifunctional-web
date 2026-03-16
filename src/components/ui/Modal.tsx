"use client";

import { useEffect } from "react";

export interface ModalData {
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkLabel?: string;
}

interface ModalProps {
  data: ModalData;
  onClose: () => void;
}

export function Modal({ data, onClose }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal card */}
      <div
        className="relative bg-[#c4a882] border-2 border-white/40 rounded-xl p-6 max-w-md w-[90%] shadow-2xl font-mono animate-[fadeIn_0.2s_ease-out]"
        style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/30">
          <h2 className="text-white text-lg tracking-wide">{data.title}</h2>
          <button
            onClick={onClose}
            className="border border-white/50 text-white/80 text-xs px-3 py-1 rounded hover:bg-white/10 transition-colors"
          >
            sair
          </button>
        </div>

        {/* Image */}
        {data.image && (
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-lg p-4 shadow-inner">
              <img src={data.image} alt={data.title} className="max-h-28 object-contain" />
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-white/90 text-xs leading-relaxed text-center mb-5">
          {data.description}
        </p>

        {/* CTA */}
        {data.link && (
          <div className="flex justify-center">
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/50 text-white/90 text-xs px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors tracking-wider"
            >
              {data.linkLabel || "Ver Projeto"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
