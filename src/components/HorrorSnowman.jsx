import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function HorrorSnowman({ position }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;

    // creepy idle sway
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.15;
    ref.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 2) * 0.05;
    ref.current.position.z += 0.04;
  });

  return (
    <group ref={ref} position={position}>
      {/* BODY */}
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#cfd2d3" roughness={0.8} />
      </mesh>

      {/* CHEST */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.9} />
      </mesh>

      {/* HEAD */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#f1f1f1" roughness={1} />
      </mesh>

      {/* LEFT EYE */}
      <mesh position={[-0.1, 1.0, 0.28]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color="red"
          emissive="red"
          emissiveIntensity={2}
        />
      </mesh>

      {/* RIGHT EYE */}
      <mesh position={[0.1, 1.0, 0.28]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color="red"
          emissive="red"
          emissiveIntensity={2}
        />
      </mesh>

      {/* SPIKE ARM (LEFT) */}
      <mesh position={[-0.7, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* SPIKE ARM (RIGHT) */}
      <mesh position={[0.7, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  );
}
