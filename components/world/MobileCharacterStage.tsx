"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { CharacterPair } from "@/components/world/CharacterPair";
import type { JourneyPhase } from "@/components/world/RouteController";

function CharacterStageGroup({ phase, scene }: { phase: JourneyPhase; scene: string }) {
  const walking =
    phase === "walkingDate" ||
    phase === "leavingDate" ||
    phase === "walkingDinner" ||
    phase === "walkingActivity" ||
    phase === "walkingDrinks";
  const facingBoard = phase !== "walkingDate" && phase !== "walkingDinner" && phase !== "walkingActivity" && phase !== "walkingDrinks";
  const rotationY =
    scene === "rooftop" ? -0.28 : scene === "activity" ? -0.12 : scene === "plaza" ? -0.06 : 0;
  const positionY = scene === "rooftop" ? -1.02 : scene === "activity" ? -1.06 : -1.08;

  return (
    <group position={[0, positionY, 0]} rotation={[0, rotationY, 0]} scale={[1.26, 1.26, 1.26]}>
      <CharacterPair facingBoard={facingBoard} phase={phase} walking={walking} />
    </group>
  );
}

export function MobileCharacterStage({ phase, scene }: { phase: JourneyPhase; scene: string }) {
  return (
    <div className={`mobile-character-stage mobile-character-stage-${scene}`}>
      <Canvas
        camera={{ fov: 28, near: 0.1, far: 40, position: [0, 2.18, 5.8] }}
        dpr={[1, 1.18]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance", stencil: false }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <ambientLight intensity={1.08} />
        <hemisphereLight args={["#ffd0ab", "#2b2130", 1.24]} />
        <directionalLight color="#ffe1c2" intensity={1.28} position={[3.6, 5.4, 4.4]} />
        <pointLight color="#9fc1ff" distance={10} intensity={0.54} position={[-2.6, 3.4, 1.6]} />
        <group position={[0, -1.66, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.6, 32]} />
            <meshBasicMaterial color="#000000" opacity={0.14} transparent />
          </mesh>
        </group>
        <Suspense fallback={null}>
          <CharacterStageGroup phase={phase} scene={scene} />
        </Suspense>
      </Canvas>
    </div>
  );
}
