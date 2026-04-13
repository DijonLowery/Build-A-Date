"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store";

interface CameraRigProps {
  targetZ: number;
}

export default function CameraRig({ targetZ }: CameraRigProps) {
  const { camera } = useThree();
  const currentZ = useRef(8);
  const swayTime = useRef(0);
  const worldPhase = useStore((s) => s.worldPhase);
  const mode = useStore((s) => s.mode);
  const introTime = useRef(0);
  const introComplete = useRef(false);

  // Match CharacterPair's duration-based walk so the camera tracks the couple
  // instead of lagging behind them. Same constants.
  const LEG_DURATION = 7;
  const legStartZ = useRef(8);
  const legTargetZ = useRef(8);
  const legTime = useRef(LEG_DURATION);

  useFrame((_, delta) => {
    swayTime.current += delta;

    // ── Pre-intro hold: while the instruction panel is up, sit on a static
    // front-view framing so the user can see both characters while reading. ──
    if (mode === "instructions" && !introComplete.current) {
      camera.position.set(0, 2.0, -4);
      camera.lookAt(0, 0.5, 8);
      return;
    }

    // ── Rose handoff camera sequence during "start" phase ──
    // Camera swings to FRONT VIEW so you see both characters face-on
    if (worldPhase === "start" && !introComplete.current) {
      introTime.current += delta;
      const t = introTime.current;

      if (t < 1.5) {
        // Wide front establishing — full bodies, streetcar, lamps all visible
        camera.position.set(0, 2.0, -4);
        camera.lookAt(0, 0.5, 8);
      } else if (t < 3.5) {
        // Gentle drift closer — still see whole scene
        const p = (t - 1.5) / 2.0;
        const ease = p * p * (3 - 2 * p);
        camera.position.set(
          THREE.MathUtils.lerp(0, 0.1, ease),
          THREE.MathUtils.lerp(2.2, 2.0, ease),
          THREE.MathUtils.lerp(-2, 0, ease)
        );
        camera.lookAt(0, THREE.MathUtils.lerp(0.6, 0.7, ease), 8);
      } else if (t < 5.0) {
        // Medium front — rose handoff visible, comfortable
        const p = (t - 3.5) / 1.5;
        const ease = p * p * (3 - 2 * p);
        camera.position.set(
          THREE.MathUtils.lerp(0.1, 0, ease),
          THREE.MathUtils.lerp(2.0, 1.9, ease),
          THREE.MathUtils.lerp(0, 1, ease)
        );
        camera.lookAt(0, 0.7, 8);
      } else if (t < 6.5) {
        // Hold as rose floats
        const p = (t - 5.0) / 1.5;
        const ease = p * p * (3 - 2 * p);
        camera.position.set(
          THREE.MathUtils.lerp(0, 0.1, ease),
          THREE.MathUtils.lerp(1.9, 2.0, ease),
          THREE.MathUtils.lerp(1, 0.5, ease)
        );
        camera.lookAt(0, 0.7, 8);
      } else if (t < 8.0) {
        // Sweep around to behind — land at wide boulevard walking view
        const p = (t - 6.5) / 1.5;
        const ease = p * p * (3 - 2 * p);
        camera.position.set(
          THREE.MathUtils.lerp(0.1, 0.4, ease),
          THREE.MathUtils.lerp(2.3, 3.2, ease),
          THREE.MathUtils.lerp(1.8, 18, ease)
        );
        camera.lookAt(
          0,
          THREE.MathUtils.lerp(0.8, 1.2, ease),
          THREE.MathUtils.lerp(8, 2, ease)
        );
      } else {
        introComplete.current = true;
      }
      return;
    }

    // ── Normal follow camera ──
    // Match CharacterPair's duration-based walk: each leg takes LEG_DURATION
    // seconds with smoothstep ease-in-out.
    if (legTargetZ.current !== targetZ) {
      legStartZ.current = currentZ.current;
      legTargetZ.current = targetZ;
      legTime.current = 0;
    }
    legTime.current = Math.min(legTime.current + delta, LEG_DURATION);
    {
      const p = legTime.current / LEG_DURATION;
      const eased = p * p * (3 - 2 * p);
      currentZ.current = THREE.MathUtils.lerp(legStartZ.current, targetZ, eased);
    }

    // Gentle cinematic sway
    const swayX = Math.sin(swayTime.current * 0.25) * 0.1;
    const swayY = Math.sin(swayTime.current * 0.18) * 0.03;

    // Phase-specific camera positions
    if (worldPhase === "dinner") {
      // Slightly lower, closer — intimate restaurant feel
      camera.position.set(
        0.6 + swayX,
        2.6 + swayY,
        currentZ.current + 6
      );
      camera.lookAt(0, 1.0, currentZ.current - 2);
    } else if (worldPhase === "activity") {
      // Lower angle, moody — speakeasy
      camera.position.set(
        0.5 + swayX,
        2.4 + swayY,
        currentZ.current + 5.5
      );
      camera.lookAt(0, 1.0, currentZ.current - 2);
    } else if (worldPhase === "drinks" || worldPhase === "reveal") {
      // Wide and slightly elevated — open rooftop
      camera.position.set(
        0.8 + swayX,
        3.5 + swayY,
        currentZ.current + 7
      );
      camera.lookAt(0, 1.5, currentZ.current - 3);
    } else {
      // Default street walk — wide boulevard view matching reference
      camera.position.set(
        0.4 + swayX,
        3.2 + swayY,
        currentZ.current + 10
      );
      camera.lookAt(0, 1.2, currentZ.current - 6);
    }
  });

  return null;
}
