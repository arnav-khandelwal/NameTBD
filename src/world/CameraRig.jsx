import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function CameraRig({ hand }) {
  const controls = useRef();
  const { camera } = useThree();
  const lastRotation = useRef(0); // Store last rotation

  useFrame(() => {
    if (hand?.active) {
      // Extend rotation range: hand.x (0 to 1) maps to more than 360 degrees
      // Multiply by 2.5 to get ~450 degrees of rotation for smoother experience
      const yaw = (hand.x - 0.5) * Math.PI * 5; 
      camera.rotation.y = yaw;
      lastRotation.current = yaw; // Store the rotation
    } else {
      // Keep the last rotation when hand is not active
      camera.rotation.y = lastRotation.current;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      target={[0, 1.6, 0]}
      enablePan={false}
      enableZoom={false}
      enableRotate={false} 
    />
  );
}
