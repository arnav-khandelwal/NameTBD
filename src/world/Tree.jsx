import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// 1. Move the helper component OUTSIDE the main component
const Ornament = ({ pos }) => (
  <mesh position={pos}>
    <sphereGeometry args={[0.08, 16, 16]} />
    <meshStandardMaterial 
      color="#ff0000" 
      emissive="#ff0000" 
      emissiveIntensity={1} 
    />
  </mesh>
);

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
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 6]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.5} />
      </mesh>

      {/* Foliage - Bottom Layer */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[1, 1.5, 6]} />
        <meshStandardMaterial 
          color="#062a1a" 
          emissive="#0a3d24" 
          emissiveIntensity={0.5} 
        />
      </mesh>
      
      {/* Foliage - Top Layer */}
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[0.7, 1.2, 6]} />
        <meshStandardMaterial 
          color="#0a3d24" 
          emissive="#165b33" 
          emissiveIntensity={0.8} 
        />
      </mesh>
{/* --- INCREASED DECORATIONS --- */}
      {/* Bottom Layer Ornaments (Wider Radius) */}
      <Ornament pos={[0.6, 1.2, 0.4]} />
      <Ornament pos={[-0.5, 1.4, -0.6]} />
      <Ornament pos={[0.2, 1.1, -0.8]} />
      <Ornament pos={[-0.8, 1.3, 0.2]} />
      <Ornament pos={[0.1, 1.6, 0.7]} />
      <Ornament pos={[0.7, 0.9, -0.2]} />
      <Ornament pos={[-0.4, 1.0, 0.6]} />
{/* <Ornament pos={[0.0, 2.7, -0.4]} /> */}
      <Ornament pos={[0.5, 2.1, -0.3]} />
      <Ornament pos={[-0.5, 2.3, -0.1]} />
      {/* Top Layer Ornaments (Narrower Radius) */} 
      {/* <Ornament pos={[0.4, 2.2, 0.2]} />
      <Ornament pos={[-0.3, 2.5, 0.4]} />
      
       */}
      {/* -------------------------

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