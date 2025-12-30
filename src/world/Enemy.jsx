import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Enemy({ id,position, image, size, health, maxHealth }) {
  const texture = useTexture(image);

  const spriteRef = useRef();
  const healthRef = useRef();
  const bgRef = useRef();

  useFrame(({ clock, camera }) => {
    if (!spriteRef.current) return;
    const floatY =
      Math.sin(clock.elapsedTime * 2 + position[0]) * 0.1;
    spriteRef.current.position.y = position[1] + floatY;

    // billboard
    spriteRef.current.quaternion.copy(camera.quaternion);
    healthRef.current.quaternion.copy(camera.quaternion);
    bgRef.current.quaternion.copy(camera.quaternion);

    // health scaling
    const ratio = THREE.MathUtils.clamp(
      health / maxHealth,
      0,
      1
    );

    // Dynamic health bar color based on health percentage
    let healthColor;
    if (ratio > 0.6) {
      healthColor = "#00ff00"; // Green - healthy
    } else if (ratio > 0.3) {
      healthColor = "#ffff00"; // Yellow - damaged
    } else {
      healthColor = "#ff0000"; // Red - critical
    }
    healthRef.current.material.color.set(healthColor);

    healthRef.current.scale.x = ratio;
    healthRef.current.position.x = -(1 - ratio) * 0.5;

    // Dynamic health bar position - always above sprite head
    const healthBarOffset = position[1] + size * 0.7 + floatY;
    healthRef.current.position.y = healthBarOffset;
    bgRef.current.position.y = healthBarOffset;
  });

  return (
    <group position={position}>
      {/* Enemy sprite */}
      <sprite ref={spriteRef} scale={[size, size, 1]} userData={{enemyId:id}}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
        />
      </sprite>

      {/* Health bar background */}
      <mesh ref={bgRef} position={[0, size * 0.7, 0]} renderOrder={999}>
        <planeGeometry args={[1.0, 0.15]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.8}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={healthRef}
        position={[0, size * 0.7, 0.001]}
        renderOrder={1000}
      >
        <planeGeometry args={[0.9, 0.12]} />
        <meshBasicMaterial 
          color="#00ff00"
          transparent
          opacity={0.95}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
