import { useState } from "react";
import { useHandInput } from "./hooks/useHandInput";
import HandCanvas from "./components/HandCanvas";

export default function App() {
  const [hand, setHand] = useState({ active: false });

  useHandInput(setHand);

  return (
    <>
      <HandCanvas
        landmarks={hand.landmarks}
        aim={hand.aim}
        fire={hand.fire}
      />

      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          color: "rgba(17, 152, 206, 1)",
          fontFamily: "monospace",
          zIndex: 20,
        }}
      >
        {!hand.active && <div>Hand not detected</div>}
        {hand.active && (
          <>
            <div>Aim: {hand.aim ? "YES" : "NO"}</div>
            <div>Fire: {hand.fire ? " YES" : "NO"}</div>
          </>
        )}
      </div>
    </>
  );
}
