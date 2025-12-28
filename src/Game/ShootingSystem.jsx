import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export default function ShootingSystem({ hand, setScore }) {
  const { camera, scene } = useThree();

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const FIRE_RATE = 200; // ms
  const lastShot = useRef(0);

  // 🔫 single bullet
  function shoot() {
    raycaster.current.setFromCamera(
    { x: 0, y: 0 },
    camera
  );

  const hits = raycaster.current.intersectObjects(
    scene.children,
    true
  );

  if (hits.length > 0) {
    let enemy = hits[0].object;
    while (enemy && !enemy.userData?.isEnemy) {
      enemy = enemy.parent;
    }

    if (!enemy) return;

    enemy.userData.health -= 25;

    if (enemy.userData.health <= 0) {
      enemy.visible = false;
      setScore(s => s + 1);
    }
  }
  }

  // 🔥 machine gun loop
  useFrame(() => {
    if (!hand) return;

    const now = performance.now();

    if (hand.fire && now - lastShot.current > FIRE_RATE) {
      shoot(hand.x, hand.y);
      lastShot.current = now;

    }
  });

  return null;
}
