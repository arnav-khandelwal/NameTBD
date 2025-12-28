import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function MuzzleFlash({ onDone }) {
  const ref = useRef();
  let life = 0;

  useFrame((_, delta) => {
    life += delta;
    if (life > 0.05) {
      onDone();
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <planeGeometry args={[0.15, 0.15]} />
      <meshBasicMaterial color="white" transparent opacity={0.9} />
    </mesh>
  );
}
