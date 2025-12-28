import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function CameraRig({ hand }) {
  const controls = useRef();
  const { camera } = useThree();
  const lastRotation = useRef(0); // Store last rotation
  const lastPitch = useRef(0); // Store last pitch
  useFrame(() => {
    if (hand?.active) {
      const yaw = (hand.x - 0.5) * Math.PI * 5; 
      camera.rotation.y = yaw;
      lastRotation.current = yaw; 

      
    } else {
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
