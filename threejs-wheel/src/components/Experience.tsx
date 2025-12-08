import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Wheel } from './Wheel';
import { ChristmasTree } from './ChristmasTree';
import { useStore } from '../store/useStore';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Simple Confetti using instanced mesh or similar could be added here, 
// but for simplicity let's use a particle system or just rely on the UI for celebration initially,
// or a simple custom implementation.
const dummy = new THREE.Object3D();

const Confetti = () => {
    const { winner } = useStore();
    const count = 100;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const particles = useRef<{pos: THREE.Vector3, vel: THREE.Vector3}[]>([]);

    useEffect(() => {
        if (winner && particles.current.length === 0) {
             for (let i = 0; i < count; i++) {
                const pos = new THREE.Vector3(0, 5, 0);
                const vel = new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 5, (Math.random() - 0.5) * 5);
                particles.current.push({ pos, vel });
             }
        } else if (!winner) {
            particles.current = [];
        }
    }, [winner]);

    useFrame((_state, delta) => {
        if (!winner || !mesh.current || particles.current.length === 0) return;
        
        particles.current.forEach((particle, i) => {
            particle.vel.y -= delta * 5; // Gravity
            particle.pos.addScaledVector(particle.vel, delta);
            
            // Bounce floor
            if (particle.pos.y < -2) {
                particle.vel.y *= -0.5;
                particle.pos.y = -2;
            }

            dummy.position.copy(particle.pos);
            dummy.scale.setScalar(0.2);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    if (!winner) return null;

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="red" />
        </instancedMesh>
    )
}

export const Experience = () => {
  return (
    <>
      <OrbitControls makeDefault />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Scene Content */}
      <group position={[0, 0, 0]}>
        <Wheel />
      </group>

      <ChristmasTree position={[5, -2, -2]} scale={0.3} />
      <ChristmasTree position={[-5, -2, -3]} scale={0.5} />

      <Confetti />
    </>
  );
};
