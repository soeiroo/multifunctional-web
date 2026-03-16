import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { GLTF } from 'three-stdlib';
import * as THREE from 'three';

type TreeGLTFResult = GLTF & {
  nodes: {
    'Node-Mesh': THREE.Mesh
    'Node-Mesh_1': THREE.Mesh
  }
  materials: {
    mat9: THREE.MeshStandardMaterial
    mat20: THREE.MeshStandardMaterial
  }
}

export function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const { nodes, materials } = useGLTF('/models/tree.glb') as unknown as TreeGLTFResult;
  
  // Clone materials to allow independent shadows and variations if needed
  const materialMat9 = useMemo(() => materials.mat9.clone(), [materials.mat9]);
  const materialMat20 = useMemo(() => materials.mat20.clone(), [materials.mat20]);

  return (
    <RigidBody type="fixed" colliders="hull" position={position}>
      <group scale={scale * 5} dispose={null}>
        <mesh 
          castShadow 
          receiveShadow 
          geometry={nodes['Node-Mesh'].geometry} 
          material={materialMat9} 
        />
        <mesh 
          castShadow 
          receiveShadow 
          geometry={nodes['Node-Mesh_1'].geometry} 
          material={materialMat20} 
        />
      </group>
    </RigidBody>
  );
}

useGLTF.preload('/models/tree.glb');
