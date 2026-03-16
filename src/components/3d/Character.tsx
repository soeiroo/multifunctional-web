"use client";

import { useKeyboardControls, PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useRef, useCallback } from "react"; // Keep useRef for RigidBody ref and new refs

const SPEED = 6.0; // Updated speed

interface CharacterProps {
  locked?: boolean;
  color?: string;
  onMove?: (position: { x: number; y: number; z: number }, rotation: number) => void;
}

export function Character({ locked = false, color = "#e8e8e8", onMove }: CharacterProps) {
  const ref = useRef<RapierRigidBody>(null);
  const { camera } = useThree(); // Use useThree to access camera
  const [, getKeys] = useKeyboardControls();

  // Movement vectors
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  // Network sync
  const lastSyncTime = useRef(0);

  // Throttle position emit (retained for potential future use or if onMove is still throttled)
  const lastEmit = useRef(0);
  const emitPosition = useCallback((pos: { x: number; y: number; z: number }, rot: number) => {
    const now = Date.now();
    if (now - lastEmit.current > 50) { // ~20fps updates
      lastEmit.current = now;
      onMove?.(pos, rot);
    }
  }, [onMove]);

  useFrame(() => { // Removed state, delta as they are not directly used in the new logic
    if (!ref.current) return;

    const { forward, backward, left, right } = getKeys();
    const velocity = ref.current.linvel();

    if (locked) {
      ref.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
    } else {
      // First person movement relative to camera rotation
      frontVector.set(0, 0, Number(backward) - Number(forward));
      sideVector.set(Number(left) - Number(right), 0, 0);
      
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(SPEED)
        .applyEuler(camera.rotation);

      // Apply X and Z movement, let Rapier handle Y (gravity) entirely
      ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
    }

    // First-person camera follow
    const translation = ref.current.translation();
    // Position camera at "eye level" (capsule height is ~1.4, eye level ~0.6 above center)
    camera.position.set(translation.x, translation.y + 0.6, translation.z);

    // Sync position for multiplayer
    const now = performance.now();
    if (onMove && now - lastSyncTime.current > 50) { // ~20fps
      // Note: PointerLockControls nests the camera inside a Yaw and Pitch object.
      // camera.rotation.y alone is not accurate here. We must extract the true world rotation.
      const worldQuat = new THREE.Quaternion();
      camera.getWorldQuaternion(worldQuat);
      const trueRotationY = new THREE.Euler().setFromQuaternion(worldQuat, "YXZ").y;

      onMove(
        { x: translation.x, y: translation.y, z: translation.z },
        trueRotationY // Broadcast true global Y rotation so others see where we face accurately
      );
      lastSyncTime.current = now;
    }
  });

  return (
    <>
      <PointerLockControls /> {/* Default capture is fine, selector makes UI clicks hard */}
      <RigidBody
        ref={ref}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 2, 0]} // Initial position
        enabledRotations={[false, false, false]} // Keep capsule upright
        linearDamping={4} // Prevent sliding when not moving
        friction={0} // Smooth movement against walls
      >
        <CapsuleCollider args={[0.5, 0.3]} />
        
        {/* Hide local body mesh so we don't clip into it from 1st person POV */}
        <group visible={false}>
        {/* Head */}
        <mesh castShadow position={[0, 1.35, 0]}>
          <boxGeometry args={[0.45, 0.45, 0.45]} />
          <meshStandardMaterial color="#fcd5b8" roughness={0.6} />
        </mesh>

        {/* Hair */}
        <mesh castShadow position={[0, 1.6, 0]}>
          <boxGeometry args={[0.48, 0.12, 0.48]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>

        {/* Body / Shirt — uses player color */}
        <mesh castShadow position={[0, 0.82, 0]}>
          <boxGeometry args={[0.5, 0.55, 0.32]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>

        {/* Left Arm */}
        <mesh castShadow position={[-0.35, 0.82, 0]}>
          <boxGeometry args={[0.18, 0.52, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>

        {/* Right Arm */}
        <mesh castShadow position={[0.35, 0.82, 0]}>
          <boxGeometry args={[0.18, 0.52, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>

        {/* Pants */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[0.48, 0.5, 0.3]} />
          <meshStandardMaterial color="#5b4a3f" roughness={0.7} />
        </mesh>

        {/* Left Shoe */}
        <mesh castShadow position={[-0.12, 0.02, 0.04]}>
          <boxGeometry args={[0.2, 0.08, 0.28]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>

        {/* Right Shoe */}
        <mesh castShadow position={[0.12, 0.02, 0.04]}>
          <boxGeometry args={[0.2, 0.08, 0.28]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>
        </group>
      </RigidBody>
    </>
  );
}
