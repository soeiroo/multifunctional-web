"use client";

import { useState, useEffect } from "react";

export interface UserSettings {
  name: string;
  modelUrl: string;
}

interface IntroScreenProps {
  onEnter: (settings: UserSettings) => void;
}

const MODELS = [
  { id: "/models/bmo.glb", label: "BMO (Adventure Time)" },
  { id: "/models/robot.glb", label: "Mecha Robot" },
  { id: "/models/tungtung.glb", label: "Tung Tung Sahur" },
  { id: "/models/cube-black-woman.glb", label: "Blocky Woman" },
];

export function IntroScreen({ onEnter }: IntroScreenProps) {
  const [name, setName] = useState("");
  const [modelUrl, setModelUrl] = useState(MODELS[0].id);

  useEffect(() => {
    const savedName = localStorage.getItem("garden_name");
    const savedModel = localStorage.getItem("garden_model");
    if (savedName) setName(savedName);
    if (savedModel) setModelUrl(savedModel);
  }, []);

  const handleEnter = () => {
    if (!name.trim()) return alert("Por favor, digite seu apelido!");
    
    localStorage.setItem("garden_name", name.trim());
    localStorage.setItem("garden_model", modelUrl);
    
    onEnter({ name: name.trim(), modelUrl });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#c4a882] font-mono select-none">
      
      <div className="bg-black/20 p-8 rounded-2xl backdrop-blur-md border border-white/20 flex flex-col items-center gap-6 max-w-md w-full">
        <h1 className="text-white text-2xl font-bold tracking-widest text-center" style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}>
          Jardim Multiplayer
        </h1>

        {/* Name Input */}
        <div className="w-full space-y-2">
          <label className="text-white/80 text-sm" style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}>SEU APELIDO:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            className="w-full bg-black/40 border border-white/30 rounded-lg px-4 py-3 text-white outline-none focus:border-green-400 transition-colors"
            placeholder="Digite seu nome..."
          />
        </div>

        {/* Model Selection */}
        <div className="w-full space-y-3">
          <label className="text-white/80 text-sm block" style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}>SEU PERSONAGEM:</label>
          <div className="grid grid-cols-1 gap-2">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModelUrl(m.id)}
                className={`px-4 py-3 rounded-lg text-sm transition-all border-2 text-left ${
                  modelUrl === m.id 
                    ? "bg-green-500/20 border-green-400 text-white" 
                    : "bg-black/40 border-transparent text-white/60 hover:bg-black/60"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="w-full mt-4 border-2 border-white/60 bg-green-500/80 text-white text-lg px-8 py-4 rounded-lg hover:bg-green-500 transition-all duration-200 tracking-widest cursor-pointer active:scale-95"
          style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
        >
          Entrar!
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-white/80 text-sm text-center space-y-2" style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}>
        <p>- WASD para mover -</p>
        <p>- Mouse para olhar em volta -</p>
      </div>
    </div>
  );
}
