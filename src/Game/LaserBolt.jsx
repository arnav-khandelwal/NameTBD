import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function LaserBolt({ id, onHit }) {
  const meshRef = useRef();
  const { camera, scene } = useThree();

  const direction = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const hasCheckedHit = useRef(false);

  const SPEED = 35;
  const MAX_DISTANCE = 50;

  // Init direction ONCE
  if (camera && direction.current.lengthSq() === 0) {
    direction.current
      .set(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .normalize();

    // Check for immediate hit from camera center (crosshair)
    raycaster.current.set(camera.position, direction.current);
    raycaster.current.camera = camera;
    
    const hits = raycaster.current.intersectObjects(
      scene.children,
      true
    );

    if (hits.length > 0) {
      let hit = hits[0].object;

      // Walk up until enemyId found
      while (hit && !hit.userData?.enemyId) {
        hit = hit.parent;
      }

      if (hit && hit.userData?.enemyId !== undefined) {
        hasCheckedHit.current = true;
        onHit(hit.userData.enemyId, id);
      }
    }
  }

  useFrame((_, delta) => {
    if (!meshRef.current || !camera || hasCheckedHit.current) return;

    //  Move laser
    meshRef.current.position.addScaledVector(
      direction.current,
      SPEED * delta
    );

    //  Raycast from laser position
    raycaster.current.set(
      meshRef.current.position,
      direction.current
    );
    raycaster.current.camera = camera;

    const hits = raycaster.current.intersectObjects(
      scene.children,
      true
    );

    if (hits.length > 0) {
      let hit = hits[0].object;

      // Walk up until enemyId found
      while (hit && !hit.userData?.enemyId) {
        hit = hit.parent;
      }

      if (hit && hit.userData?.enemyId !== undefined) {
        hasCheckedHit.current = true;
        onHit(hit.userData.enemyId, id);
      } else {
        // hit something else (tree / floor)
        hasCheckedHit.current = true;
        onHit(null, id);
      }      
    }
    
    if (
      meshRef.current.position.distanceTo(camera.position) >
      MAX_DISTANCE
    ) {
      onHit(null, id);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={camera ? camera.position.clone() : [0, 0, 0]}
    >
      <icosahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial
        color="#ffcc00"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}