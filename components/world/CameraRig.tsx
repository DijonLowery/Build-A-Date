"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
  activityFocusPosition,
  activityRevealCameraPosition,
  activityRevealLookPosition,
  activityStopCameraPosition,
  activityStopLookPosition,
  boardPosition,
  dateFocusPosition,
  dateRevealCameraPosition,
  dateRevealLookPosition,
  dateStopCameraPosition,
  dateStopLookPosition,
  dinnerFocusPosition,
  dinnerRevealCameraPosition,
  dinnerRevealLookPosition,
  dinnerStopCameraPosition,
  dinnerStopLookPosition,
  drinksFocusPosition,
  drinksRevealCameraPosition,
  drinksRevealLookPosition,
  drinksStopCameraPosition,
  drinksStopLookPosition
} from "@/lib/routeConfig";
import type { JourneyPhase, JourneyStop } from "@/components/world/RouteController";

type CameraRigProps = {
  activeStop: JourneyStop | null;
  lookBiasRef: React.MutableRefObject<{ x: number; y: number }>;
  pairRigRef: React.MutableRefObject<THREE.Group | null>;
  phase: JourneyPhase;
};

const stopConfigs = {
  date: {
    focus: new THREE.Vector3(...dateFocusPosition),
    revealCamera: new THREE.Vector3(...dateRevealCameraPosition),
    revealLook: new THREE.Vector3(...dateRevealLookPosition),
    stopCamera: new THREE.Vector3(...dateStopCameraPosition),
    stopLook: new THREE.Vector3(...dateStopLookPosition),
    stopFov: 43.6,
    travelFov: 46.6
  },
  activity: {
    focus: new THREE.Vector3(...activityFocusPosition),
    revealCamera: new THREE.Vector3(...activityRevealCameraPosition),
    revealLook: new THREE.Vector3(...activityRevealLookPosition),
    stopCamera: new THREE.Vector3(...activityStopCameraPosition),
    stopLook: new THREE.Vector3(...activityStopLookPosition),
    stopFov: 39.2,
    travelFov: 46.2
  },
  dinner: {
    focus: new THREE.Vector3(...dinnerFocusPosition),
    revealCamera: new THREE.Vector3(...dinnerRevealCameraPosition),
    revealLook: new THREE.Vector3(...dinnerRevealLookPosition),
    stopCamera: new THREE.Vector3(...dinnerStopCameraPosition),
    stopLook: new THREE.Vector3(...dinnerStopLookPosition),
    stopFov: 38.2,
    travelFov: 47.5
  },
  drinks: {
    focus: new THREE.Vector3(...drinksFocusPosition),
    revealCamera: new THREE.Vector3(...drinksRevealCameraPosition),
    revealLook: new THREE.Vector3(...drinksRevealLookPosition),
    stopCamera: new THREE.Vector3(...drinksStopCameraPosition),
    stopLook: new THREE.Vector3(...drinksStopLookPosition),
    stopFov: 35.6,
    travelFov: 44.6
  }
} as const;

function getTravelStop(phase: JourneyPhase): JourneyStop | null {
  if (phase === "introBrief" || phase === "walkingDate") {
    return "date";
  }

  if (phase === "walkingDinner") {
    return "dinner";
  }

  if (phase === "walkingActivity") {
    return "activity";
  }

  if (phase === "walkingDrinks") {
    return "drinks";
  }

  return null;
}

export function CameraRig({ activeStop, lookBiasRef, pairRigRef, phase }: CameraRigProps) {
  const { camera, size } = useThree();
  const boardVector = new THREE.Vector3(...boardPosition);
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const scenicCamera = new THREE.Vector3();
  const scenicLook = new THREE.Vector3();
  const isPhonePortrait = size.width <= 560 && size.height > size.width;

  useFrame((state, delta) => {
    if (!pairRigRef.current) {
      return;
    }

    const pair = pairRigRef.current;
    const lookBias = lookBiasRef.current;
    const travelStop = getTravelStop(phase);
    const scenicConfig = travelStop ? stopConfigs[travelStop] : null;
    const activeConfig = activeStop ? stopConfigs[activeStop] : null;
    const phoneDateTravel = isPhonePortrait && travelStop === "date";
    const phoneDateStop = isPhonePortrait && activeStop === "date";
    const phoneActivityShot = isPhonePortrait && (travelStop === "activity" || activeStop === "activity");
    const phoneDrinksShot = isPhonePortrait && (travelStop === "drinks" || activeStop === "drinks");
    const walking =
      phase === "introBrief" ||
      phase === "walkingDate" ||
      phase === "leavingDate" ||
      phase === "walkingDinner" ||
      phase === "walkingActivity" ||
      phase === "walkingDrinks";
    const stopMode =
      phase === "arrivedDate" ||
      phase === "selectingDate" ||
      phase === "lockedDate" ||
      phase === "arrivedDinner" ||
      phase === "selectingDinner" ||
      phase === "lockedDinner" ||
      phase === "arrivedActivity" ||
      phase === "selectingActivity" ||
      phase === "lockedActivity" ||
      phase === "arrivedDrinks" ||
      phase === "selectingDrinks" ||
      phase === "lockedDrinks" ||
      phase === "finalReveal" ||
      phase === "submitted";
    const departureMode = phase === "leavingDate";
    const sway = Math.sin(state.clock.elapsedTime * 0.74) * 0.1;
    const driftY = Math.sin(state.clock.elapsedTime * 1.18) * 0.06;

    const defaultWalkPosition = new THREE.Vector3(
      pair.position.x - (isPhonePortrait ? 1.06 : 1.46) + lookBias.x * (isPhonePortrait ? 0.08 : 0.2) + sway * (isPhonePortrait ? 0.24 : 0.82),
      (isPhonePortrait ? 2.74 : 3.22) + driftY + lookBias.y * (isPhonePortrait ? 0.06 : 0.1),
      pair.position.z + (isPhonePortrait ? 7.86 : 9.14)
    );

    const departurePosition = new THREE.Vector3(
      pair.position.x - (isPhonePortrait ? 1.16 : 2.34) + lookBias.x * (isPhonePortrait ? 0.08 : 0.14) + sway * (isPhonePortrait ? 0.22 : 0.56),
      (isPhonePortrait ? 2.92 : 3.28) + driftY + lookBias.y * 0.06,
      pair.position.z + (isPhonePortrait ? 7.52 : 8.94)
    );

    if (scenicConfig) {
      const distance = pair.position.distanceTo(scenicConfig.focus);
      const revealBlend = 1 - THREE.MathUtils.smootherstep(distance, 8, 22);
      const scenicFollow = new THREE.Vector3(
        pair.position.x - (phoneDateTravel ? 1.16 : phoneActivityShot ? 0.92 : phoneDrinksShot ? 0.96 : 1.24) + lookBias.x * (isPhonePortrait ? 0.08 : 0.14) + sway * (isPhonePortrait ? 0.16 : 0.22),
        (phoneDateTravel ? 3.24 : phoneDrinksShot ? 3.92 : isPhonePortrait ? 3.06 : 3.58) + driftY + lookBias.y * (isPhonePortrait ? 0.05 : 0.08),
        pair.position.z + (phoneDateTravel ? 9.4 : phoneDrinksShot ? 10.2 : isPhonePortrait ? 8.9 : 11.8)
      );

      scenicCamera.set(
            THREE.MathUtils.lerp(
              scenicFollow.x,
              scenicConfig.revealCamera.x + (phoneDateTravel ? -0.22 : phoneActivityShot ? -0.14 : phoneDrinksShot ? 0.06 : 0) + sway * 0.06,
              revealBlend
            ),
            THREE.MathUtils.lerp(
              scenicFollow.y,
              scenicConfig.revealCamera.y + (phoneDateTravel ? -0.42 : phoneDrinksShot ? -0.24 : isPhonePortrait ? -0.34 : 0) + driftY * 0.18,
          revealBlend
        ),
            THREE.MathUtils.lerp(
              scenicFollow.z,
              scenicConfig.revealCamera.z + (phoneDateTravel ? 2.4 : phoneDrinksShot ? 1.4 : isPhonePortrait ? 2.1 : 0),
              revealBlend
            )
      );

      const scenicWalkLook = new THREE.Vector3(
        pair.position.x + (phoneDateTravel ? 0.28 : phoneActivityShot ? 0.52 : phoneDrinksShot ? 0.42 : 1.18) + lookBias.x * (isPhonePortrait ? 0.08 : 0.18),
        (phoneDateTravel ? 1.42 : phoneDrinksShot ? 1.84 : isPhonePortrait ? 1.48 : 1.84) + lookBias.y * (isPhonePortrait ? 0.04 : 0.08),
        pair.position.z - (phoneDateTravel ? 12.6 : phoneDrinksShot ? 13.4 : isPhonePortrait ? 11.8 : 7.4)
      );

      scenicLook.set(
        THREE.MathUtils.lerp(scenicWalkLook.x, scenicConfig.revealLook.x, revealBlend),
        THREE.MathUtils.lerp(scenicWalkLook.y, scenicConfig.revealLook.y, revealBlend),
        THREE.MathUtils.lerp(scenicWalkLook.z, scenicConfig.revealLook.z, revealBlend)
      );
    }

    const desiredPosition = stopMode
      ? activeConfig
        ? new THREE.Vector3(
          activeConfig.stopCamera.x + (phoneDateStop ? -0.42 : phoneActivityShot ? -0.18 : phoneDrinksShot ? -0.06 : 0) + sway * 0.06,
            activeConfig.stopCamera.y + (phoneDateStop ? -0.62 : phoneDrinksShot ? -0.24 : isPhonePortrait ? -0.42 : 0) + driftY * 0.14,
            activeConfig.stopCamera.z + (phoneDateStop ? 2.62 : phoneDrinksShot ? 1.64 : isPhonePortrait ? 2.14 : 0)
          )
        : new THREE.Vector3(
            pair.position.x - (isPhonePortrait ? 1.1 : 3.08) + lookBias.x * (isPhonePortrait ? 0.08 : 0.12) + sway * (isPhonePortrait ? 0.2 : 0.28),
            (isPhonePortrait ? 2.98 : 3.34) + driftY + lookBias.y * (isPhonePortrait ? 0.05 : 0.08),
            pair.position.z + (isPhonePortrait ? 7.96 : 8.72)
          )
      : scenicConfig
        ? scenicCamera
        : defaultWalkPosition;

    const cameraTarget = departureMode ? departurePosition : desiredPosition;

    perspectiveCamera.position.x = THREE.MathUtils.damp(perspectiveCamera.position.x, cameraTarget.x, 4.2, delta);
    perspectiveCamera.position.y = THREE.MathUtils.damp(perspectiveCamera.position.y, cameraTarget.y, 4.1, delta);
    perspectiveCamera.position.z = THREE.MathUtils.damp(perspectiveCamera.position.z, cameraTarget.z, 4.1, delta);

    const defaultWalkLook = new THREE.Vector3(
      pair.position.x + (phoneDateTravel ? 0.14 : 0.34) + lookBias.x * (isPhonePortrait ? 0.08 : 0.18),
      (phoneDateTravel ? 1.36 : isPhonePortrait ? 1.44 : 1.78) + lookBias.y * (isPhonePortrait ? 0.04 : 0.08),
      pair.position.z - (phoneDateTravel ? 11.8 : isPhonePortrait ? 10.8 : 6.8)
    );

    const stopLook = activeConfig
      ? activeStop === "drinks"
        ? new THREE.Vector3(
            activeConfig.stopLook.x,
            activeConfig.stopLook.y + (phoneDrinksShot ? 0.1 : 0),
            activeConfig.stopLook.z
          )
        : new THREE.Vector3(
            THREE.MathUtils.lerp(
              pair.position.x + (phoneDateStop ? 0.44 : 0.82),
              activeConfig.stopLook.x + (phoneActivityShot ? -0.18 : 0),
              phoneDateStop ? 0.58 : 0.82
            ),
            activeConfig.stopLook.y + (phoneDrinksShot ? 0.22 : 0),
            THREE.MathUtils.lerp(
              pair.position.z - (phoneDateStop ? 1.3 : 2.18),
              activeConfig.stopLook.z,
              phoneDateStop ? 0.62 : 0.84
            )
          )
      : new THREE.Vector3(
          THREE.MathUtils.lerp(pair.position.x + 0.18, boardVector.x - 0.34, 0.54),
          isPhonePortrait ? 1.46 : 1.82,
          THREE.MathUtils.lerp(pair.position.z - (isPhonePortrait ? 4.8 : 1.3), boardVector.z - 0.42, isPhonePortrait ? 0.84 : 0.7)
        );

    const departureLook = new THREE.Vector3(
      THREE.MathUtils.lerp(pair.position.x + 0.3, boardVector.x + 0.28, 0.24),
      isPhonePortrait ? 1.42 : 1.8,
      THREE.MathUtils.lerp(pair.position.z - (isPhonePortrait ? 4.6 : 2.1), pair.position.z - (isPhonePortrait ? 10.2 : 6.8), 0.56)
    );

    perspectiveCamera.lookAt(stopMode ? stopLook : departureMode ? departureLook : scenicConfig ? scenicLook : defaultWalkLook);

    if (walking) {
      const targetFov =
        departureMode
          ? isPhonePortrait ? 55.6 : 38.9
          : scenicConfig
            ? scenicConfig.travelFov + (phoneDateTravel ? 12.2 : phoneDrinksShot ? 8.6 : isPhonePortrait ? 9.2 : 0)
            : 39.5;
      perspectiveCamera.fov = THREE.MathUtils.damp(perspectiveCamera.fov, targetFov, 4, delta);
    } else {
      const targetFov = activeConfig ? activeConfig.stopFov + (phoneDateStop ? 10.8 : phoneDrinksShot ? 6.2 : isPhonePortrait ? 6.8 : 0) : isPhonePortrait ? 47.6 : 36.2;
      perspectiveCamera.fov = THREE.MathUtils.damp(perspectiveCamera.fov, targetFov, 4, delta);
    }

    perspectiveCamera.updateProjectionMatrix();
  });

  return null;
}
