"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

/* ------------------------------------------------------------------ */
/*  Minimal character-only scene used to bake `opengraph-image.jpg`.   */
/*                                                                     */
/*  How to regenerate the OG image:                                    */
/*    1. `npm run dev` and open this page at exactly 1200×630.         */
/*    2. Run a tiny localhost receiver that POSTs `canvas.toDataURL`   */
/*       output to /tmp (see /tmp/og-receiver.js in repo history).    */
/*    3. Composite the dusk gradient + 3D canvas + sub-brand text into */
/*       a 2D canvas and POST it to the receiver. Write the result to  */
/*       `app/opengraph-image.jpg` and `app/twitter-image.jpg`.        */
/* ------------------------------------------------------------------ */

// SkinnedMesh-aware clone — `scene.clone()` from three.js loses skeletons.
function useClonedGLB(path: string) {
  const { scene } = useGLTF(path);
  return useMemo(() => clone(scene), [scene]);
}

function DijonModel() {
  const model = useClonedGLB("/models/dijon.glb");
  return (
    <group position={[-0.38, 0, 0]} rotation={[0, -0.18, 0]}>
      <group rotation={[0, Math.PI, 0]}>
        <primitive object={model} scale={0.7} position={[0, 0.65, 0]} />
      </group>
    </group>
  );
}

function MadisonModel() {
  const model = useClonedGLB("/models/madison.glb");
  return (
    <group position={[0.38, 0, 0]} rotation={[0, 0.18, 0]}>
      <group rotation={[0, Math.PI, 0]}>
        <primitive object={model} scale={0.7} position={[0, 0.65, 0]} />
      </group>
    </group>
  );
}

function RoseModel() {
  const model = useClonedGLB("/models/rose.glb");
  return (
    <group position={[0.35, 0.5, 0.1]}>
      <primitive object={model} scale={0.35} />
    </group>
  );
}

useGLTF.preload("/models/dijon.glb");
useGLTF.preload("/models/madison.glb");
useGLTF.preload("/models/rose.glb");

// Aim at the characters' torsos so the faces sit just above center frame.
function CameraAim() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 1.05, 0);
    if ("updateProjectionMatrix" in camera) {
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  }, [camera]);
  return null;
}

export default function OGPreviewPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        // Dusk gradient — deep plum top fading to warm amber bottom
        background:
          "radial-gradient(ellipse at 50% 60%, rgba(62,32,48,1) 0%, rgba(30,18,32,1) 40%, rgba(12,8,16,1) 100%)"
      }}
    >
      {/* Soft warm glow behind the characters */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          width: 820,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(240,180,140,0.30) 0%, rgba(220,120,150,0.13) 40%, transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none"
        }}
      />

      <Canvas
        camera={{ position: [0, 1.8, -5.2], fov: 28 }}
        gl={{
          antialias: true,
          alpha: true,
          // toDataURL needs the back buffer preserved between paints
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <CameraAim />

        <ambientLight intensity={0.5} color="#f4e0d0" />
        <directionalLight position={[3, 4, -3]} intensity={1.6} color="#ffd9a8" />
        <directionalLight position={[-2, 2.5, 4]} intensity={0.8} color="#a9b8ff" />
        <directionalLight position={[0, 6, -1]} intensity={0.5} color="#fff" />

        <Suspense fallback={null}>
          <Environment preset="sunset" background={false} />
          <group scale={[1.6, 1.6, 1.6]}>
            <DijonModel />
            <MadisonModel />
            <RoseModel />
          </group>
        </Suspense>
      </Canvas>

      {/* Sub-brand mark at the bottom — DOM-rendered for crispness */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 28,
          textAlign: "center",
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 500,
            color: "rgba(255,220,200,0.55)",
            marginBottom: 6
          }}
        >
          Build&nbsp;·&nbsp;A&nbsp;·&nbsp;Date
        </div>
        <div
          style={{
            fontSize: 18,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            color: "rgba(255,235,220,0.85)",
            letterSpacing: "0.02em"
          }}
        >
          Made for Madison.
        </div>
      </div>
    </div>
  );
}
