"use client";

import { useRef, useLayoutEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface OtherPlayerProps {
  position: { x: number; y: number; z: number };
  rotation: number;
  color: string;
  name: string;
  modelUrl: string;
}

export function OtherPlayer({ position, rotation, color, name, modelUrl }: OtherPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const visualsRef = useRef<THREE.Group>(null);
  
  // Y offset for CapsuleCollider (center is ~0.8, so subtract 0.8 to touch ground)
  const Y_OFFSET = -0.8;
  
  const targetPos = useRef(new THREE.Vector3(position.x, position.y + Y_OFFSET, position.z));
  const targetRot = useRef(rotation);
  const bobPhase = useRef(0);

  // Preload and clone GLTF model so multiple players can use the same URL without geometry conflicts
  const safeModelUrl = modelUrl || "/models/bmo.glb";
  const { scene } = useGLTF(safeModelUrl);
  
  // SkeletonUtils is required to properly clone SkinnedMeshes (characters with bones/animations)
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Adjust scales depending on the model's native export size
  let modelScale = 0.5;
  if (safeModelUrl.includes("cube-black-woman")) modelScale = 0.35;
  else if (safeModelUrl.includes("tungtung")) modelScale = 0.8;

  // Update targets on new network props
  targetPos.current.set(position.x, position.y + Y_OFFSET, position.z);
  targetRot.current = rotation;

  // Initialize position to avoid flying from 0,0,0
  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(targetPos.current);
      groupRef.current.rotation.y = targetRot.current;
    }
  }, []);

  // Smooth interpolation and walk animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Movement distance to see if we should walk-bob
    const distSq = groupRef.current.position.distanceToSquared(targetPos.current);
    const isMoving = distSq > 0.001;

    // Smooth position and rotation
    groupRef.current.position.lerp(targetPos.current, 0.2);
    
    // Smooth quaternion rotation (fixes the 180 degree snapping/spinning bug)
    // Add Math.PI (180 deg) because the 3D models face +Z by default, but camera looks down -Z
    const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetRot.current + Math.PI, 0));
    groupRef.current.quaternion.slerp(targetQ, 0.2);

    // Visual walk bobbing
    if (visualsRef.current) {
      if (isMoving) {
        bobPhase.current += delta * 12;
        visualsRef.current.position.y = Math.abs(Math.sin(bobPhase.current)) * 0.12;
      } else {
        bobPhase.current = 0;
        visualsRef.current.position.y = THREE.MathUtils.lerp(visualsRef.current.position.y, 0, 0.2);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={visualsRef}>
        
        {/* Render the dynamically loaded 3D Model */}
        <primitive 
          object={clonedScene} 
          position={[0, 0, 0]} 
          scale={modelScale} 
        />

        {/* Name tag floating above character */}
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </group>
    </group>
  );
}

// Preload the specific model files so they're instantly ready when joining
useGLTF.preload("/models/bmo.glb");
useGLTF.preload("/models/robot.glb");
useGLTF.preload("/models/tungtung.glb");
useGLTF.preload("/models/cube-black-woman.glb");
