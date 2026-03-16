"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";
import { InteractiveZone } from "./InteractiveZone";
import { OtherPlayer } from "./OtherPlayer";
import type { ModalData } from "../ui/Modal";
import type { PlayerData } from "@/lib/socket";
import * as THREE from "three";
import { generateColony, KENNEY_MODELS, RenderInstance, SpecialZones } from "@/lib/proceduralColony";

// Preload all models
const PATH = "/models/kenney_space-kit/Models/GLTF format/";
if (typeof window !== "undefined") {
  KENNEY_MODELS.forEach((file) => useGLTF.preload(PATH + file));
}

function SpaceModel({ url, position, rotation = [0, 0, 0], scale = 1 }: { url: string; position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(), [scene, url]);
  return <primitive object={cloned} position={position} rotation={rotation} scale={scale} />;
}

function SolidModel({ instance }: { instance: RenderInstance }) {
  return (
    <RigidBody type="fixed" colliders={instance.colliderType || "trimesh"} position={instance.position} rotation={instance.rotation}>
      <SpaceModel url={instance.url} position={[0, 0, 0]} scale={instance.scale} />
    </RigidBody>
  );
}

interface WorldProps {
  isNight: boolean;
  onOpenModal: (data: ModalData) => void;
  onCloseModal: () => void;
  otherPlayers?: PlayerData[];
  roomId?: string | null;
}

export function World({ isNight, onOpenModal, onCloseModal, otherPlayers = [], roomId }: WorldProps) {
  const groundColor = "#d37c56"; // Martian orange surface

  // Generate colony data once based on roomId seed
  const colony = useMemo(() => {
    const seed = roomId || "mars_colony_prime";
    return generateColony(seed);
  }, [roomId]);

  return (
    <group>
      {/* ━━━ Ground & Terraforming ━━━ */}
      <RigidBody type="fixed" colliders="cuboid" name="ground">
        <mesh receiveShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[150, 0.5, 150]} />
          <meshStandardMaterial color={groundColor} roughness={1} metalness={0} />
        </mesh>
      </RigidBody>

      {/* ━━━ Procedural City Instances ━━━ */}
      <group name="procedural-colony">
        {colony.instances.map((inst, index) => (
          <SolidModel key={`inst-${index}`} instance={inst} />
        ))}
      </group>

      {/* ━━━ Visual Redirection Indicators ━━━ */}
      <PortalCircle position={colony.zones.videoHub} color="#3b82f6" />
      <PortalCircle position={colony.zones.rocket} color="#10b981" />
      <PortalCircle position={colony.zones.comms} color="#f59e0b" />
      <PortalCircle position={colony.zones.arquivos} color="#8b5cf6" />

      {/* ━━━ Other Players (multiplayer) ━━━ */}
      {otherPlayers.map((p) => (
        <OtherPlayer
          key={p.id}
          position={p.position}
          rotation={p.rotation}
          color={p.color}
          name={p.name}
          modelUrl={p.modelUrl}
        />
      ))}

      {/* ━━━ Interactive Zones ━━━ */}
      {/* Video Hub (Center Base) */}
      <InteractiveZone
        position={colony.zones.videoHub}
        args={[3, 4, 3]}
        color="#3b82f6"
        label="Video Hub"
        modalData={{
          title: "Player de Vídeo",
          description: "Assista transmissões na matriz principal do núcleo.",
          link: roomId ? `/player?room=${roomId}` : "/player",
          linkLabel: "Abrir Player",
        }}
        onOpenModal={onOpenModal}
        onCloseModal={onCloseModal}
      />
      
      {/* Create Room (Rocket Pad/Spawn) */}
      <InteractiveZone
        position={colony.zones.rocket}
        args={[4, 4, 4]}
        color="#10b981"
        label="Rocket Launch"
        modalData={{
          title: "Missão Multiplayer",
          description: roomId
            ? `Você está na missão: ${roomId}. Chame co-pilotos copiando o link!`
            : "Inicie um novo servidor para criar uma colônia paralela procedural!",
          link: roomId ? undefined : "/room/new",
          linkLabel: roomId ? "Copiar Link" : "Iniciar Servidor",
        }}
        onOpenModal={onOpenModal}
        onCloseModal={onCloseModal}
      />
      
      {/* Contact (Communication Tower) */}
      <InteractiveZone
        position={colony.zones.comms}
        args={[3, 4, 3]}
        color="#f59e0b"
        label="Comms"
        modalData={{
          title: "Sinal de Rádio (Contato)",
          description: "Quer transmitir uma mensagem direta ao desenvolvedor da base?",
          linkLabel: "Enviar Sinal",
        }}
        onOpenModal={onOpenModal}
        onCloseModal={onCloseModal}
      />

      {/* About (Lab / Outpost) */}
      <InteractiveZone
        position={colony.zones.arquivos}
        args={[3, 4, 3]}
        color="#8b5cf6"
        label="Arquivos"
        modalData={{
          title: "Arquivos da Missão (Sobre Mim)",
          description: "Laboratório de bio-engenharia focado em terraformação de Marte.",
          linkLabel: "Abrir Registros",
        }}
        onOpenModal={onOpenModal}
        onCloseModal={onCloseModal}
      />

      {/* ━━━ Boundaries ━━━ */}
      <Boundary position={[0, 0, -75]} rotation={[0, 0, 0]} />
      <Boundary position={[0, 0, 75]} rotation={[0, Math.PI, 0]} />
      <Boundary position={[-75, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Boundary position={[75, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
}

function Boundary({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <mesh visible={false}>
        <boxGeometry args={[150, 40, 1]} />
      </mesh>
    </RigidBody>
  );
}

function PortalCircle({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  
  // Safeguard array coordinates from zones object
  const cleanPos: [number, number, number] = [
    position[0] || 0,
    (position[1] || 0) + 0.1, // Float slightly above ground
    position[2] || 0
  ];

  useFrame((_, delta) => {
    if (ref.current) {
      timeRef.current += delta;
      ref.current.rotation.z -= 0.02;
      const scale = 1 + Math.sin(timeRef.current * 2) * 0.05;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={cleanPos} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ref}>
        <ringGeometry args={[1.5, 1.8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
