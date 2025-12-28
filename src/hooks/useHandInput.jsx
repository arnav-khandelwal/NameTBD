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

export function useHandInput(onUpdate, isGameActive) {
  useEffect(() => {
    if (!isGameActive) return;
    let handLandmarker;
    let video;

    let camX = 0.5;
    let camY = 0.5;

    let fireState = false;
    let fireSince = 0;
    let lastSeen = performance.now();

    async function init() {
      video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      if (!isGameActive) {
        if (video?.srcObject) {
  video.srcObject.getTracks().forEach(t => t.stop());
}

        return;
      }
      else {
        video.style.position = "fixed";
        video.style.left = "10px";
        video.style.bottom = "120px";
        video.style.width = "180px";
        document.body.appendChild(video);
      }
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      function loop() {
        if (video.readyState < 2) {
          requestAnimationFrame(loop);
          return;
        }

        let gunHand = null;
        let cameraHand = null;
        const now = performance.now();
        const result = handLandmarker.detectForVideo(video, now);

        if (result.landmarks?.length) {
          result.landmarks.forEach((lm, i) => {
            const side = result.handednesses[i][0].categoryName;
            if (side === "Right") cameraHand = lm;
            if (side === "Left") gunHand = lm;
          });
        }

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
        if (cameraHand) {
          const indexTip = cameraHand[8];
          camX += ((1 - indexTip.x) - camX) * 0.18;
          camY += ((1 - indexTip.y) - camY) * 0.18;
        }

        let aim = false;
        let lm = gunHand;

        if (gunHand) {
          const indexExt = isFingerExtended(lm, 8, 6);
          const middleExt = isFingerExtended(lm, 12, 10);
          aim = indexExt && middleExt;  // ✅ Fixed: was aimGesture

          const handScale = dist3(lm[0], lm[9]);

          const thumbPoints = [2, 3, 4];
          const indexPoints = [5, 6, 7];

          let minPinchDist = 100000;
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
            aim &&
            (
              (verticalHand && (dist3(lm[4], lm[8]) < 0.18 || dist3(lm[2], lm[5]) < 0.28)) ||
              (!verticalHand && thumbTowardsIndex && pinchNorm < 0.3)
            );

          fireState = fire;

          onUpdate({
            active: !!(gunHand || cameraHand),
            x: camX,
            y: camY,
            aim: aim,
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
        } else {
          onUpdate({
            active: !!(cameraHand),
            x: camX,
            y: camY,
            aim: false,
            fire: false,
            landmarks: null,
          });
        }

        requestAnimationFrame(loop);
      }

      loop();
    }

    init();

    return () => {
      video?.srcObject?.getTracks().forEach(t => t.stop());
      video?.parentNode?.removeChild(video);
    };
  }, [onUpdate , isGameActive]);
}
