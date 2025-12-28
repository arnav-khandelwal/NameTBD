import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Tree({ position }) {
  const crystalRef = useRef();

  useFrame((state) => {
    if (crystalRef.current) {
      // Pulse the glow intensity to make it look alive
      const pulse = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      crystalRef.current.material.emissiveIntensity = pulse;
    }
  });

  return (
    <group position={position}>
      {/* Trunk - Darker but with a slight rim light */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 6]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.5} />
      </mesh>

      {/* Foliage - Using Emissive to pop against the black */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[1, 1.5, 6]} />
        <meshStandardMaterial 
          color="#062a1a" 
          emissive="#0a3d24" 
          emissiveIntensity={0.5} 
        />
      </mesh>
      
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[0.7, 1.2, 6]} />
        <meshStandardMaterial 
          color="#0a3d24" 
          emissive="#165b33" 
          emissiveIntensity={0.8} 
        />
      </mesh>

      {/* The Magical Core Light */}
      <pointLight 
        position={[0, 3, 0]} 
        intensity={2} 
        distance={10} 
        color="#00ffff" 
      />

      {/* The Floating Mage Crystal */}
      <mesh ref={crystalRef} position={[0, 3.5, 0]}>
        <octahedronGeometry args={[0.2]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={2} 
        />
      </mesh>
    </group>
  );
}