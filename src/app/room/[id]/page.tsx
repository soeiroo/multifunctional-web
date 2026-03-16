"use client";

import { useState, useCallback, Suspense, use } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, KeyboardControls, Stars } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Character } from "@/components/3d/Character";
import { World } from "@/components/3d/World";
import { IntroScreen, type UserSettings } from "@/components/ui/IntroScreen";
import { Modal, type ModalData } from "@/components/ui/Modal";
import { useSocket } from "@/lib/socket";
import * as THREE from "three";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "interact", keys: ["KeyE"] },
];

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);
  const [showIntro, setShowIntro] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [playerData, setPlayerData] = useState<UserSettings | null>(null);

  const { connected, players, emitMove } = useSocket(showIntro ? null : roomId, playerData);

  const handleOpenModal = useCallback((data: ModalData) => setModalData(data), []);
  const handleCloseModal = useCallback(() => setModalData(null), []);

  const handleMove = useCallback(
    (position: { x: number; y: number; z: number }, rotation: number) => {
      emitMove(position, rotation);
    },
    [emitMove]
  );

  // Environment & lighting config (Space Theme)
  const fogColor = isNight ? "#050508" : "#0f0f16";
  const sunColor = isNight ? "#e0e0f8" : "#ffffff";
  const sunIntensity = isNight ? 0.3 : 1.5;
  const ambientColor = isNight ? "#1a2540" : "#2a3550";
  const ambientIntensity = isNight ? 0.2 : 0.6;
  const hemiSky = isNight ? "#050510" : "#101020";
  const hemiGround = isNight ? "#020205" : "#050510";
  const hemiIntensity = isNight ? 0.4 : 0.8;
  const envPreset = "night";

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden" style={{ backgroundColor: fogColor }}>
      {showIntro && (
        <IntroScreen
          onEnter={(data) => {
            setPlayerData(data);
            setShowIntro(false);
          }}
        />
      )}
      {modalData && <Modal data={modalData} onClose={handleCloseModal} />}

      {/* HUD Top Bar */}
      <div className="fixed top-4 left-4 z-30 flex items-center gap-2">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-white text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
          <span>Sala: {roomId}</span>
          <span className="text-white/40">|</span>
          <span>👥 {players.length + 1}</span>
        </div>
        <button
          onClick={copyRoomLink}
          className="bg-blue-500/80 hover:bg-blue-500 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
        >
          📋 Copiar Link
        </button>
      </div>

      {/* Day/Night Toggle */}
      <button
        onClick={() => setIsNight(!isNight)}
        className="fixed top-4 right-4 z-30 border-2 border-white/40 bg-white/10 backdrop-blur-sm w-11 h-11 rounded-lg flex items-center justify-center text-xl hover:bg-white/20 transition-all shadow-lg cursor-pointer"
        title={isNight ? "Modo Dia" : "Modo Noite"}
      >
        {isNight ? "🌙" : "☀️"}
      </button>

      {/* 3D Canvas */}
      <div id="canvas-container" className="w-full h-screen">
        <KeyboardControls map={keyboardMap}>
          <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={[1, 2]}
            camera={{ position: [0, 1.6, 0], fov: 75, near: 0.1, far: 200 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: isNight ? 0.7 : 1.3,
            }}
          >
            <fog attach="fog" args={[fogColor, 20, 90]} />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <hemisphereLight args={[hemiSky, hemiGround, hemiIntensity]} position={[0, 50, 0]} />
            <ambientLight intensity={ambientIntensity} color={ambientColor} />
            <directionalLight
              castShadow
              position={isNight ? [-40, 30, -20] : [60, 80, 40]}
              intensity={sunIntensity}
              color={sunColor}
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.0001}
              shadow-normalBias={0.02}
            >
              <orthographicCamera attach="shadow-camera" args={[-45, 45, 45, -45, 0.5, 200]} />
            </directionalLight>

            <Suspense fallback={null}>
              <Physics>
                <World
                  isNight={isNight}
                  onOpenModal={handleOpenModal}
                  onCloseModal={handleCloseModal}
                  otherPlayers={players}
                  roomId={roomId}
                />
                <Character locked={modalData !== null} onMove={handleMove} />
              </Physics>
            </Suspense>

            <Environment preset={envPreset} background blur={0} backgroundIntensity={isNight ? 0.1 : 0.4} />
          </Canvas>
        </KeyboardControls>
      </div>

      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 w-1.5 h-1.5 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 shadow-[0_0_2px_rgba(0,0,0,0.5)]" />
    </main>
  );
}
