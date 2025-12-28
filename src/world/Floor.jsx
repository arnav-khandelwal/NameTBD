import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useEffect } from "react";


export default function Floor() {
  const ref = useRef();
useEffect(() => {
  const { position } = ref.current.geometry.attributes;
  for (let i = 0; i < position.count; i++) {
    // Create random heights for snow drifts
    const z = position.getZ(i);
    position.setZ(i, z + Math.random() * 0.2); 
  }
  position.needsUpdate = true;
}, []);
  useFrame(({ clock }) => {
    if (ref.current) {
      // Subtle "glimmer" effect on the snow instead of heavy flashing
      ref.current.material.emissiveIntensity =
        0.1 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]} // Slightly lowered to avoid clipping
      receiveShadow
    >
      {/* High segments (128, 128) allow for smoother "snow bumps" */}
      <planeGeometry args={[50, 50, 128, 128]} />
      <meshStandardMaterial
        color="#ffffff"          /* Pure White Snow */
        emissive="#daeef2"       /* Icy Blue Glimmer */
        roughness={0.8}          /* Snow isn't perfectly shiny */
        metalness={0.1}
        flatShading={false}
      />
    </mesh>
  );
}