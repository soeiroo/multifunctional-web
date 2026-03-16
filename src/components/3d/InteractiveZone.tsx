"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import type { ModalData } from "../ui/Modal";

interface InteractiveZoneProps {
  position: [number, number, number];
  color?: string;
  label: string;
  modalData: ModalData;
  onOpenModal: (data: ModalData) => void;
  onCloseModal: () => void;
  args?: [number, number, number];
}

export function InteractiveZone({ position, color = "#f43f5e", label, modalData, onOpenModal, onCloseModal, args = [4, 4, 4] }: InteractiveZoneProps) {
  const isNear = useRef(false);

  const handleEnter = useCallback(() => {
    isNear.current = true;
    onOpenModal(modalData);
  }, [modalData, onOpenModal]);

  const handleExit = useCallback(() => {
    isNear.current = false;
    onCloseModal();
  }, [onCloseModal]);

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      {/* Explicit sensor collider (CuboidCollider uses half-extents) */}
      <CuboidCollider
        args={[args[0] / 2, args[1] / 2, args[2] / 2]}
        sensor
        onIntersectionEnter={handleEnter}
        onIntersectionExit={handleExit}
      />
    </RigidBody>
  );
}
