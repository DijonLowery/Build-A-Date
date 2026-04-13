"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Minimal character-only scene for the iMessage/OG preview.          */
/*  Rendered at exactly 1200x630 — screenshot by navigating to /og at  */
/*  that viewport size and saving `canvas.toDataURL(...)` to           */
/*  `src/app/opengraph-image.jpg`.                                     */
/* ------------------------------------------------------------------ */

/*
 * We copy the transform chain from `CharacterPair.tsx` verbatim — that's the
 * setup that actually renders these GLBs on screen. The models have skinned
 * meshes whose skeletons get reparented into the scene graph; any deviation
 * (e.g. cloning the scene, skipping the Math.PI rotation, dropping the 0.65
 * Y offset) results in one or both characters rendering invisible. The outer
 * `scale={[1.6,1.6,1.6]}` wrapper matches the main app's CharacterPair root
 * group.
 *
 * Camera sits at -Z looking toward +Z (same hemisphere as the main app) so
 * the characters' Math.PI-rotated front faces the lens.
 */
function DijonCharacter() {
  const { scene } = useGLTF("/models/dijon.glb");
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={scene} scale={0.7} position={[0, 0.65, 0]} />
    </group>
  );
}

function MadisonCharacter() {
  const { scene } = useGLTF("/models/madison.glb");
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={scene} scale={0.7} position={[0, 0.65, 0]} />
    </group>
  );
}

function Rose() {
  const { scene } = useGLTF("/models/rose.glb");
  return <primitive object={scene} scale={0.35} />;
}

useGLTF.preload("/models/dijon.glb");
useGLTF.preload("/models/madison.glb");
useGLTF.preload("/models/rose.glb");

// Aim the camera at the characters' torsos so the faces sit just above center.
function CameraAim() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 1.05, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

export default function OGPreviewPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        // Dusk gradient — deep plum at top fading to warm amber at the
        // bottom, matching the app's fairy-tale aesthetic.
        background:
          "radial-gradient(ellipse at 50% 60%, rgba(62,32,48,1) 0%, rgba(30,18,32,1) 40%, rgba(12,8,16,1) 100%)",
      }}
    >
      {/* Soft warm glow behind characters */}
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
          pointerEvents: "none",
        }}
      />

      <Canvas
        camera={{ position: [0, 1.8, -5.2], fov: 28 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <CameraAim />

        {/* Ambient fill so no surface goes pitch black */}
        <ambientLight intensity={0.5} color="#f4e0d0" />

        {/* Warm key light from the camera side, upper-right */}
        <directionalLight
          position={[3, 4, -3]}
          intensity={1.6}
          color="#ffd9a8"
        />

        {/* Cool rim light from behind the characters (+Z) for separation */}
        <directionalLight
          position={[-2, 2.5, 4]}
          intensity={0.8}
          color="#a9b8ff"
        />

        {/* Soft top light to catch hair / shoulders */}
        <directionalLight position={[0, 6, -1]} intensity={0.5} color="#fff" />

        <Suspense fallback={null}>
          {/* Drei's sunset preset gives beautiful soft GI on the figures */}
          <Environment preset="sunset" background={false} />

          {/* Outer wrapper matches CharacterPair's root scale */}
          <group scale={[1.6, 1.6, 1.6]}>
            {/* Dijon on the left, angled slightly toward Madison */}
            <group position={[-0.38, 0, 0]} rotation={[0, -0.18, 0]}>
              <DijonCharacter />
            </group>
            {/* Madison on the right, angled slightly toward Dijon */}
            <group position={[0.38, 0, 0]} rotation={[0, 0.18, 0]}>
              <MadisonCharacter />
            </group>
            {/* Rose in Madison's hand — matches the handoff resting pose */}
            <group position={[0.35, 0.5, 0.1]}>
              <Rose />
            </group>
          </group>
        </Suspense>
      </Canvas>

      {/* Sub-brand mark at bottom — rendered in DOM so it looks crisp */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 28,
          textAlign: "center",
          pointerEvents: "none",
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
            marginBottom: 6,
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
            letterSpacing: "0.02em",
          }}
        >
          Made for Madison.
        </div>
      </div>
    </div>
  );
}
