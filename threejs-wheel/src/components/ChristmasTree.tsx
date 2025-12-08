import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ChristmasTree = (props: any) => {
  const { scene } = useGLTF('/src/glb/xmas_tree.glb');
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
        // Gentle swaying or rotation
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene.clone()} />
    </group>
  );
};

useGLTF.preload('/src/glb/xmas_tree.glb');
