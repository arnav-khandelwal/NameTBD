import { useEffect } from "react";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

function isFingerOpen(tip, base) {
  return tip.y < base.y;
}

export function useHandInput(onUpdate) {
  useEffect(() => {
    let handLandmarker;
    let video;
    // persistent state
    let smoothX = 0.5;
    let smoothY = 0.5;
    let fireState = false;
    let lastSeen = performance.now();

    
    async function init() {
      video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      video.srcObject = stream;

      video.style.position = "fixed";
      video.style.right = "10px";
      video.style.bottom = "10px";
      video.style.width = "160px";
      document.body.appendChild(video);

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      handLandmarker = await HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 1,
        }
      );

      function loop() {
        if (video.readyState >= 2) {
          const now = performance.now();
          const result = handLandmarker.detectForVideo(video, now);

          if (!result.landmarks || result.landmarks.length === 0) {
            if (performance.now() - lastSeen > 700) {
              onUpdate({ active: false });
            }
          } else {
            lastSeen = performance.now();

            const lm = result.landmarks[0];

            const index = lm[8];
            const targetX = 1 - index.x;
            const targetY = 1 - index.y;

            smoothX += (targetX - smoothX) * 0.15;
            smoothY += (targetY - smoothY) * 0.15;

            const indexOpen  = isFingerOpen(lm[8],  lm[6]);
            const middleOpen = isFingerOpen(lm[12], lm[10]);

            const thumbIndexDist = Math.hypot(
              lm[4].x - lm[8].x,
              lm[4].y - lm[8].y
            );

            const thumbTouching    = thumbIndexDist < 0.035;
            const thumbNotTouching = thumbIndexDist > 0.055;

            const aimGesture =
              indexOpen &&
              middleOpen &&
              thumbNotTouching;

            const fireGesture =
              indexOpen &&
              middleOpen &&
              thumbTouching;

            if (fireGesture) fireState = true;
            if (aimGesture) fireState = false;

          
            onUpdate({
              active: true,
              x: smoothX,
              y: smoothY,
              aim: aimGesture,
              fire: fireState,
              landmarks: lm.map(p => ({
                x: p.x,
                y: p.y,
                z: p.z,
              })),
            });
          }
        }
        requestAnimationFrame(loop);
      }

      loop();
    }

    init();

    return () => {
      if (video?.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
      }
      if (video?.parentNode) {
        video.parentNode.removeChild(video);
      }
    };
  }, []);
}
