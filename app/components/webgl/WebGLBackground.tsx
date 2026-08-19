"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";

export default function WebGLBackground() {
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    []
  );

  return (
    <div className="webgl-canvas fixed inset-0 z-0 pointer-events-none">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "auto",
        }}
      >
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={isMobile ? 1 : [1, 2]}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Scene />
        </Canvas>
      </div>
    </div>
  );
}
