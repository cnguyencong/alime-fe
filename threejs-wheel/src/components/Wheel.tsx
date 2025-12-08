import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../store/useStore";

const WHEEL_RADIUS = 3;
const WHEEL_DEPTH = 0.3;
const RIM_WIDTH = 0.2;

export const Wheel = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { names, isSpinning, stopSpin, setWinner } = useStore();
  const [rotationSpeed, setRotationSpeed] = useState(0);

  const segmentAngle = (Math.PI * 2) / names.length;

  useEffect(() => {
    if (isSpinning) {
      setRotationSpeed(0.5 + Math.random() * 0.5);
    }
  }, [isSpinning]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    if (isSpinning) {
      const newSpeed = Math.max(0, rotationSpeed - delta * 0.1);
      setRotationSpeed(newSpeed);

      groupRef.current.rotation.z += newSpeed;

      if (newSpeed <= 0) {
        stopSpin();

        const pointerAngle = Math.PI / 2;
        const normalizedRotation = groupRef.current.rotation.z % (Math.PI * 2);

        let effectiveAngle =
          (pointerAngle - normalizedRotation) % (Math.PI * 2);
        if (effectiveAngle < 0) effectiveAngle += Math.PI * 2;

        const winningIndex =
          Math.floor(effectiveAngle / segmentAngle) % names.length;

        if (names[winningIndex]) {
          setWinner(names[winningIndex]);
        }
      }
    }
  });

  if (names.length === 0) return null;

  // Create segment shape
  const createSegmentShape = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.arc(0, 0, WHEEL_RADIUS, 0, segmentAngle, false);
    shape.lineTo(0, 0);
    return shape;
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Stand Base */}
      <mesh position={[0, -WHEEL_RADIUS - 1.2, 0]} castShadow>
        <boxGeometry args={[2.5, 0.4, 1.8]} />
        <meshStandardMaterial color="#8B0000" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Stand Pole */}
      <mesh position={[0, -WHEEL_RADIUS / 2 - 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, WHEEL_RADIUS + 0.5, 0.5]} />
        <meshStandardMaterial color="#DAA520" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* The Wheel Group that spins */}
      <group ref={groupRef} rotation={[0, 0, 0]}>
        {/* Wheel Segments */}
        {names.map((participant, index) => {
          const angle = index * segmentAngle;

          return (
            <group key={participant.id} rotation={[0, 0, angle]}>
              {/* Segment using ExtrudeGeometry for flat pie slice */}
              <mesh position={[0, 0, 0]} castShadow>
                <extrudeGeometry
                  args={[
                    createSegmentShape(),
                    {
                      depth: WHEEL_DEPTH,
                      bevelEnabled: false,
                    },
                  ]}
                />
                <meshStandardMaterial
                  color={participant.color}
                  metalness={0.2}
                  roughness={0.6}
                />
              </mesh>

              {/* Segment Border Line */}
              <mesh
                position={[WHEEL_RADIUS / 2, 0, WHEEL_DEPTH + 0.01]}
                rotation={[0, 0, 0]}
              >
                <boxGeometry args={[WHEEL_RADIUS, 0.03, 0.02]} />
                <meshStandardMaterial color="#FFD700" metalness={0.8} />
              </mesh>

              {/* Text */}
              <group
                position={[WHEEL_RADIUS * 0.6, 0, WHEEL_DEPTH + 0.02]}
                rotation={[0, 0, segmentAngle / 2]}
              >
                <Text
                  color="white"
                  fontSize={0.22}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.015}
                  outlineColor="#000000"
                  fontWeight="bold"
                >
                  {participant.name}
                </Text>
              </group>
            </group>
          );
        })}

        {/* Outer Decorative Rim */}
        <mesh position={[0, 0, WHEEL_DEPTH / 2]} castShadow>
          <torusGeometry
            args={[WHEEL_RADIUS + RIM_WIDTH / 2, RIM_WIDTH, 16, 64]}
          />
          <meshStandardMaterial
            color="#DAA520"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Decorative Dots on Rim */}
        {Array.from({ length: names.length }).map((_, i) => {
          const angle = (i / names.length) * Math.PI * 2;
          const x = Math.cos(angle) * (WHEEL_RADIUS + RIM_WIDTH / 2);
          const y = Math.sin(angle) * (WHEEL_RADIUS + RIM_WIDTH / 2);
          const dotColor =
            i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF6B6B" : "#4169E1";

          return (
            <mesh key={`dot-${i}`} position={[x, y, WHEEL_DEPTH / 2]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color={dotColor}
                emissive={dotColor}
                emissiveIntensity={0.4}
                metalness={0.6}
              />
            </mesh>
          );
        })}

        {/* Center Hub - Outer Ring */}
        <mesh position={[0, 0, WHEEL_DEPTH + 0.1]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.25, 32]} />
          <meshStandardMaterial
            color="#DAA520"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Center Hub - Inner Circle */}
        <mesh position={[0, 0, WHEEL_DEPTH + 0.25]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
          <meshStandardMaterial
            color="#4169E1"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Center Star */}
        <mesh position={[0, 0, WHEEL_DEPTH + 0.35]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.6}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Pointer */}
      <mesh
        position={[0, WHEEL_RADIUS + RIM_WIDTH + 0.4, WHEEL_DEPTH / 2]}
        rotation={[0, 0, Math.PI]}
        castShadow
      >
        <coneGeometry args={[0.3, 0.7, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#DAA520"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
};
