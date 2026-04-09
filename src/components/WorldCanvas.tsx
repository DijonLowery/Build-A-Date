"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import CityScene from "./CityScene";

export default function WorldCanvas() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ width: "100%", height: "100%" }}
      >
        <fog attach="fog" args={["#c08060", 50, 100]} />
        <Suspense fallback={null}>
          <CityScene />
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.35}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.8}
              mipmapBlur
            />
            <Vignette offset={0.35} darkness={0.5} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
