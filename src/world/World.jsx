import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Floor from "./Floor";
import CameraRig from "./CameraRig";
import Enemy from "./Enemy";
import Tree from "./Tree";

export default function World({ hand, enemies }) {
  const treePositions = [
  [5, 0, -5], [-7, 0, -10], [12, 0, 5], [-3, 0, 8]
, [8, 0, -15], [-10, 0, 3], [15, 0, -8], [-5, 0, -12]
, [0, 0, 15], [-15, 0, -3], [10, 0, 12], [-8, 0, 10], [6, 0, -20]
];
  return (
    <Canvas
      camera={{
        fov: 75,
        near: 0.1,
        far: 100,
        position: [0, 1.6, 5],
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      <Suspense fallback={null}>
        <CameraRig hand={hand} />
  
        <Floor />
        {treePositions.map((pos, i) => (
      <Tree key={i} position={pos} />
    ))}
        
        {/* Render 3D enemies */}
        {enemies && enemies.map(enemy => (
          <Enemy
            key={enemy.id}
            position={enemy.position}
            image={enemy.image}
            size={enemy.size}
          />
        ))}
       
      </Suspense>
    </Canvas>
  );
}
