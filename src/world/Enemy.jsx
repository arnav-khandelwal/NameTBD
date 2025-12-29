import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Enemy({ position, image, size, health, maxHealth }) {
  const texture = useTexture(image);

  const spriteRef = useRef();
  const healthRef = useRef();
  const bgRef = useRef();
  const healthColor =
    health > maxHealth * 0.5 ? "#2ecc71" : "#e74c3c";

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

    healthRef.current.scale.x = ratio;
    healthRef.current.position.x = -(1 - ratio) * 0.25;
  });

  return (
    <group position={position}>
      {/* Enemy sprite */}
      <sprite ref={spriteRef} scale={[size, size, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
        />
      </sprite>

      {/* Health bar background */}
      <mesh ref={bgRef} position={[0, size , 0]}>
        <planeGeometry args={[0.5, 0.06]} />
        <meshBasicMaterial color="black" transparent opacity={0.6} />
      </mesh>

      <mesh
        ref={healthRef}
        position={[0, size, 0.001]}
      >
        <planeGeometry args={[0.45, 0.04]} />
        <meshBasicMaterial color={healthColor} />
      </mesh>
    </group>
  );
}
