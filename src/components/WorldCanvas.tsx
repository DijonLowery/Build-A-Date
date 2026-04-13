"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import CityScene from "./CityScene";
import { useStore } from "@/store";

function DesktopEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export default function WorldCanvas() {
  const isMobile = useStore((s) => s.isMobile);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: "high-performance",
          ...(isMobile ? { stencil: false, depth: true } : {}),
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Softer fog for HDRI — blends distant buildings into sky */}
        <fog attach="fog" args={[isMobile ? "#3a3040" : "#4a4050", isMobile ? 40 : 55, isMobile ? 80 : 110]} />
        <Suspense fallback={null}>
          <CityScene />
          {!isMobile && <DesktopEffects />}
        </Suspense>
      </Canvas>
    </div>
  );
}
