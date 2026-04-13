"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store";

interface CharacterPairProps {
  targetZ: number;
}

/* ------------------------------------------------------------------ */
/*  Dijon character                                                    */
/* ------------------------------------------------------------------ */
function DijonCharacter() {
  const { scene } = useGLTF("/models/dijon.glb");
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={scene} scale={0.7} position={[0, 0.65, 0]} />
    </group>
  );
}

useGLTF.preload("/models/dijon.glb");

/* ------------------------------------------------------------------ */
/*  Madison character                                                  */
/* ------------------------------------------------------------------ */
function MadisonCharacter() {
  const { scene } = useGLTF("/models/madison.glb");
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={scene} scale={0.7} position={[0, 0.65, 0]} />
    </group>
  );
}

useGLTF.preload("/models/madison.glb");

/* ------------------------------------------------------------------ */
/*  Rose                                                               */
/* ------------------------------------------------------------------ */
function Rose() {
  const { scene } = useGLTF("/models/rose.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <primitive object={cloned} scale={1} />
  );
}

useGLTF.preload("/models/rose.glb");

/* ------------------------------------------------------------------ */
/*  Cinematic intro phases (with rose handoff built in)                */
/*  0-1.0s:  apart, facing each other                                  */
/*  1.0-2.5s: Dijon steps toward Madison                               */
/*  2.5-3.5s: together, hand taken, facing each other                  */
/*  3.5-5.0s: rose appears in Dijon's hand, grows in                   */
/*  5.0-6.5s: rose floats from Dijon to Madison                        */
/*  6.5-7.5s: Madison takes rose, they turn forward                    */
/*  7.5+:     intro complete, begin walking (rose stays with Madison)  */
/* ------------------------------------------------------------------ */

export default function CharacterPair({ targetZ }: CharacterPairProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dijonRef = useRef<THREE.Group>(null);
  const madisonRef = useRef<THREE.Group>(null);
  const roseRef = useRef<THREE.Group>(null);
  const currentZ = useRef(8);
  const bobTime = useRef(0);

  const { setIsMoving, setShowChoice, advancePhase, worldPhase, mode } = useStore();
  const wasMoving = useRef(false);
  const hasInitialized = useRef(false);

  // Cinematic intro state
  const introTime = useRef(0);
  const introComplete = useRef(false);

  // Walking leg: fixed 7-second duration with ease-in-out, regardless of
  // distance. When `targetZ` changes we snapshot the start and tick a leg
  // clock toward 1.0 over LEG_DURATION seconds.
  const LEG_DURATION = 7;
  const legStartZ = useRef(8);
  const legTargetZ = useRef(8);
  const legTime = useRef(LEG_DURATION);

  useFrame((_, delta) => {
    if (!groupRef.current || !dijonRef.current || !madisonRef.current) return;

    // ── Pre-intro hold: while the instruction panel is up, put the characters
    // in their opening pose (apart, angled toward each other) without ticking
    // the intro clock. The intro begins the moment the user enters "world". ──
    if (mode === "instructions" && !introComplete.current) {
      // Park the whole group at the same starting Z that the intro uses so the
      // CameraRig "instructions" framing (camera at z=-4 looking at z=8) sees
      // the characters at a comfortable distance.
      groupRef.current.position.set(0, 0, 8);
      dijonRef.current.position.set(-0.7, 0, 0);
      madisonRef.current.position.set(0.7, 0, 0);
      dijonRef.current.rotation.y = -0.3;
      madisonRef.current.rotation.y = 0.2;
      if (roseRef.current) roseRef.current.scale.setScalar(0);
      return;
    }

    // ── Cinematic intro sequence (includes rose handoff) ──
    if (!introComplete.current && worldPhase === "start") {
      introTime.current += delta;
      const t = introTime.current;

      if (t < 1.0) {
        // Phase 0: Starting positions — apart, angled toward each other
        dijonRef.current.position.x = -0.7;
        madisonRef.current.position.x = 0.7;
        dijonRef.current.rotation.y = -0.3;
        madisonRef.current.rotation.y = 0.2;
        if (roseRef.current) roseRef.current.scale.setScalar(0);
      } else if (t < 2.5) {
        // Phase 1: Dijon steps toward Madison — closes the gap
        const p = (t - 1.0) / 1.5;
        const ease = p * p * (3 - 2 * p);
        dijonRef.current.position.x = THREE.MathUtils.lerp(-0.7, -0.3, ease);
        madisonRef.current.position.x = THREE.MathUtils.lerp(0.7, 0.35, ease);
        dijonRef.current.rotation.y = THREE.MathUtils.lerp(-0.3, -0.4, ease);
        madisonRef.current.rotation.y = THREE.MathUtils.lerp(0.2, 0.25, ease);
        dijonRef.current.position.z = THREE.MathUtils.lerp(0, -0.05, ease);
        if (roseRef.current) roseRef.current.scale.setScalar(0);
      } else if (t < 3.5) {
        // Phase 2: Together — hand taken, facing each other
        dijonRef.current.position.set(-0.3, 0, -0.05);
        madisonRef.current.position.set(0.35, 0, 0);
        dijonRef.current.rotation.y = -0.4;
        madisonRef.current.rotation.y = 0.25;
        if (roseRef.current) roseRef.current.scale.setScalar(0);
      } else if (t < 5.0) {
        // Phase 3: Rose appears in Dijon's hand, grows in
        // Negative Z = in front of character (toward camera)
        dijonRef.current.position.set(-0.3, 0, -0.05);
        madisonRef.current.position.set(0.35, 0, 0);
        dijonRef.current.rotation.y = -0.4;
        madisonRef.current.rotation.y = 0.25;
        if (roseRef.current) {
          const rp = (t - 3.5) / 1.5;
          const rEase = Math.min(1, rp);
          roseRef.current.position.set(
            THREE.MathUtils.lerp(-0.35, -0.25, rEase),
            THREE.MathUtils.lerp(0.3, 0.55, rEase),
            THREE.MathUtils.lerp(-0.2, -0.25, rEase)
          );
          roseRef.current.rotation.set(0.3, rEase * 0.5, -0.8 + rEase * 0.3);
          const s = THREE.MathUtils.lerp(0.0, 0.35, Math.min(1, rp * 1.5));
          roseRef.current.scale.setScalar(s);
        }
      } else if (t < 6.5) {
        // Phase 4: Rose floats from Dijon's hand toward Madison's hand
        dijonRef.current.rotation.y = -0.4;
        madisonRef.current.rotation.y = 0.25;
        if (roseRef.current) {
          const rp = (t - 5.0) / 1.5;
          const rEase = rp * rp * (3 - 2 * rp);
          roseRef.current.position.set(
            THREE.MathUtils.lerp(-0.25, 0.3, rEase),
            THREE.MathUtils.lerp(0.55, 0.6, rEase),
            THREE.MathUtils.lerp(-0.25, -0.2, rEase)
          );
          roseRef.current.rotation.set(0.3, 0.5 + rEase * 0.3, -0.5);
          roseRef.current.scale.setScalar(0.35);
        }
      } else if (t < 7.5) {
        // Phase 5: Madison takes the rose, they turn forward
        if (roseRef.current) {
          const rp = (t - 6.5) / 1.0;
          const rEase = rp * rp * (3 - 2 * rp);
          roseRef.current.position.set(
            THREE.MathUtils.lerp(0.3, 0.35, rEase),
            THREE.MathUtils.lerp(0.6, 0.5, rEase),
            THREE.MathUtils.lerp(-0.2, -0.1, rEase)
          );
          roseRef.current.scale.setScalar(0.35);
        }
        const tp = (t - 6.5) / 1.0;
        const tEase = tp * tp * (3 - 2 * tp);
        dijonRef.current.rotation.y = THREE.MathUtils.lerp(-0.4, 0, tEase);
        madisonRef.current.rotation.y = THREE.MathUtils.lerp(0.25, 0, tEase);
        dijonRef.current.position.set(-0.3, 0, THREE.MathUtils.lerp(-0.05, 0, tEase));
        madisonRef.current.position.set(0.35, 0, 0);
      } else {
        // Phase 6: Intro complete — begin walking, rose stays with Madison
        introComplete.current = true;
        dijonRef.current.position.set(-0.3, 0, 0);
        madisonRef.current.position.set(0.35, 0, 0);
        dijonRef.current.rotation.y = 0;
        madisonRef.current.rotation.y = 0;
        if (roseRef.current) {
          roseRef.current.position.set(0.35, 0.5, 0.1);
          roseRef.current.scale.setScalar(0.35);
        }
      }

      // During intro, keep the group at start position
      groupRef.current.position.set(0, 0, 8);
      return;
    }

    // ── First frame after intro: kick off walking ──
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      dijonRef.current.position.set(-0.3, 0, 0);
      madisonRef.current.position.set(0.35, 0, 0);
      dijonRef.current.rotation.y = 0;
      madisonRef.current.rotation.y = 0;
      if (roseRef.current) {
        roseRef.current.position.set(0.35, 0.5, 0.1);
        roseRef.current.scale.setScalar(0.35);
      }
      if (worldPhase === "start") {
        advancePhase();
      }
    }

    // ── Walking logic — duration-based leg (7s with ease-in-out) ──
    // A new leg starts whenever targetZ changes: snapshot the current Z and
    // reset the leg clock. The leg clock ticks toward LEG_DURATION over delta
    // seconds, and position is a smoothstep-interpolated lerp between the
    // snapshot and the new target.
    if (legTargetZ.current !== targetZ) {
      legStartZ.current = currentZ.current;
      legTargetZ.current = targetZ;
      legTime.current = 0;
    }

    legTime.current = Math.min(legTime.current + delta, LEG_DURATION);
    const p = legTime.current / LEG_DURATION;
    const eased = p * p * (3 - 2 * p); // smoothstep
    currentZ.current = THREE.MathUtils.lerp(legStartZ.current, targetZ, eased);

    const moving = p < 1;

    if (moving) {
      bobTime.current += delta * 5;
    }

    // Detect arrival at stop — all stops behave the same now
    if (wasMoving.current && !moving) {
      currentZ.current = targetZ; // snap
      setIsMoving(false);
      setTimeout(() => setShowChoice(true), 300);
    }
    wasMoving.current = moving;

    const bob = moving ? Math.sin(bobTime.current) * 0.03 : 0;
    groupRef.current.position.set(0, bob, currentZ.current);

    // Keep rose at Madison's side while walking
    if (roseRef.current) {
      roseRef.current.position.set(0.35, 0.5, 0.1);
      roseRef.current.scale.setScalar(0.35);
    }
  });

  return (
    <group ref={groupRef} scale={[1.6, 1.6, 1.6]}>
      <group ref={dijonRef}>
        <DijonCharacter />
      </group>
      <group ref={madisonRef}>
        <MadisonCharacter />
      </group>
      <group ref={roseRef}>
        <Rose />
      </group>
    </group>
  );
}
