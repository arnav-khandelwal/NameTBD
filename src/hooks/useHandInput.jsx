import { useEffect } from "react";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

function dist3(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function isFingerExtended(lm, tip, pip) {
  const wrist = lm[0];
  return dist3(lm[tip], wrist) > dist3(lm[pip], wrist);
}

export function useHandInput(onUpdate) {
  useEffect(() => {
    let handLandmarker;
    let video;

    let smoothX = 0.5;
    let smoothY = 0.5;

    let fireState = false;
    let fireSince = 0;
    let lastSeen = performance.now();

    async function init() {
      video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      video.style.position = "fixed";
      video.style.right = "10px";
      video.style.bottom = "10px";
      video.style.width = "140px";
      document.body.appendChild(video);

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
      function loop() {
        if (video.readyState < 2) {
          requestAnimationFrame(loop);
          return;
        }

        const now = performance.now();
        const result = handLandmarker.detectForVideo(video, now);

        if (!result.landmarks || result.landmarks.length === 0) {
          if (now - lastSeen > 600) {
            fireState = false;
            fireSince = 0;
            onUpdate({ active: false, fire: false });
          }
          requestAnimationFrame(loop);
          return;
        }

        lastSeen = now;
        const lm = result.landmarks[0];

        const indexTip = lm[8];
        smoothX += ((1 - indexTip.x) - smoothX) * 0.18;
        smoothY += ((1 - indexTip.y) - smoothY) * 0.18;
        

const indexExt  = isFingerExtended(lm, 8, 6);
const middleExt = isFingerExtended(lm, 12, 10);
const aimGesture = indexExt && middleExt;

const handScale = dist3(lm[0], lm[9]); 

const thumbPoints = [2,3, 4];
const indexPoints = [5, 6, 8];

let minPinchDist = Infinity;
for (const t of thumbPoints) {
  for (const i of indexPoints) {
    minPinchDist = Math.min(minPinchDist, dist3(lm[t], lm[i]));
  }
}

const pinchNorm = minPinchDist / handScale;

const palmVec = {
          x: lm[9].x - lm[0].x,
          y: lm[9].y - lm[0].y,
          z: lm[9].z - lm[0].z,
        };

        const verticalHand =
  Math.abs(palmVec.z) >
  1.2 * Math.max(Math.abs(palmVec.x), Math.abs(palmVec.y));


const indexDir = {
          x: lm[8].x - lm[5].x,
          y: lm[8].y - lm[5].y,
          z: lm[8].z - lm[5].z,
        };

        const thumbDir = {
          x: lm[4].x - lm[5].x,
          y: lm[4].y - lm[5].y,
          z: lm[4].z - lm[5].z,
        };

        const dot =
          indexDir.x * thumbDir.x +
          indexDir.y * thumbDir.y +
          indexDir.z * thumbDir.z;

        const magI = Math.hypot(indexDir.x, indexDir.y, indexDir.z);
        const magT = Math.hypot(thumbDir.x, thumbDir.y, thumbDir.z);

        const thumbTowardsIndex =
          magI > 0 &&
          magT > 0 &&
          dot / (magI * magT) > 0.4;    
const fire =
          aimGesture &&
          (
            (verticalHand && (dist3(lm[4], lm[8]) < 0.18)) ||
            (!verticalHand && thumbTowardsIndex )
          );  

fireState = fire; 
        onUpdate({
          active: true,
          x: smoothX,
          y: smoothY,
          aim: aimGesture,
          fire: fireState,
          verticalHand,
          pinchNorm,
          pinchStrength: Math.max(0, 0.06 - minPinchDist) / 0.06,

          landmarks: lm.map(p => ({
            x: p.x,
            y: p.y,
            z: p.z,
          })),
        });

        requestAnimationFrame(loop);
      }

      loop();
    }

    init();

    return () => {
      video?.srcObject?.getTracks().forEach(t => t.stop());
      video?.parentNode?.removeChild(video);
    };
  }, [onUpdate]);
} 