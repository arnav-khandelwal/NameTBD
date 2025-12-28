import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Enemy({ position, image, size }) {
  const texture = useTexture(image);
  const meshRef = useRef();

  // Add subtle floating animation and make sprite face camera
  useFrame(({ clock, camera }) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.1;
      
      // Make sprite always face the camera (billboard effect)
      meshRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <sprite ref={meshRef} position={position} scale={[size, size, 1]}
    userData={{ isEnemy: true, health: 25 }}>
      <spriteMaterial 
        map={texture} 
        transparent 
        opacity={1}
        depthWrite={false}
      />
    </sprite>
  );
}
