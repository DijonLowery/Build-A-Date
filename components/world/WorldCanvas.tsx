"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload, useProgress } from "@react-three/drei";
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  N8AO,
  ToneMapping,
  Vignette
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";

import { CharacterPair } from "@/components/world/CharacterPair";
import { CityScene } from "@/components/world/CityScene";
import type { JourneyPhase, JourneyStop } from "@/components/world/RouteController";
import { SceneLighting } from "@/components/world/SceneLighting";

type WorldCanvasProps = {
  onActivityOpen: () => void;
  onWorldReady?: () => void;
  phase: JourneyPhase;
  selectedActivityId: string | null;
  selectedDinnerId: string | null;
  selectedDateId: string | null;
  selectedDrinksId: string | null;
  onArrive: (stop: JourneyStop) => void;
  onBoardOpen: () => void;
  onDinnerOpen: () => void;
  onDrinksOpen: () => void;
  transitioning?: boolean;
};

const ROUTE_POINTS = [
  new THREE.Vector3(0, 0, 18),
  new THREE.Vector3(0.4, 0, 11),
  new THREE.Vector3(1, 0, 4),
  new THREE.Vector3(2.2, 0, -4),
  new THREE.Vector3(3.2, 0, -12),
  new THREE.Vector3(3.6, 0, -18.2),
  new THREE.Vector3(4.2, 0, -30),
  new THREE.Vector3(3.4, 0, -42),
  new THREE.Vector3(1.8, 0, -52.2),
  new THREE.Vector3(0, 0, -66),
  new THREE.Vector3(-0.8, 0, -78),
  new THREE.Vector3(-1.2, 0, -88.4),
  new THREE.Vector3(0.2, 0.8, -102),
  new THREE.Vector3(2.8, 2.4, -116),
  new THREE.Vector3(4.8, 4.1, -126.5),
  new THREE.Vector3(6.1, 4.8, -132.6)
] as const;

const STOP_PROGRESS = {
  activity: 0.66,
  date: 0.24,
  dinner: 0.48,
  drinks: 0.98
} as const;

const STOP_FOCUS = {
  activity: new THREE.Vector3(-0.6, 4.1, -85.6),
  date: new THREE.Vector3(2.7, 1.55, -18.8),
  dinner: new THREE.Vector3(1.2, 1.75, -53.6),
  drinks: new THREE.Vector3(6.3, 5.7, -147.8)
} as const;

const STOP_CAMERA = {
  activity: new THREE.Vector3(2.8, 4.2, -81.8),
  date: new THREE.Vector3(-2.5, 3.3, -13.1),
  dinner: new THREE.Vector3(-3.4, 4.3, -45.2),
  drinks: new THREE.Vector3(2.9, 6.6, -124.8)
} as const;

function vectorForPhase(phase: JourneyPhase) {
  if (phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate") {
    return "date";
  }

  if (phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner") {
    return "dinner";
  }

  if (phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity") {
    return "activity";
  }

  if (phase === "arrivedDrinks" || phase === "selectingDrinks" || phase === "lockedDrinks" || phase === "finalReveal" || phase === "submitted") {
    return "drinks";
  }

  return null;
}

function isWalkingPhase(phase: JourneyPhase) {
  return (
    phase === "walkingDate" ||
    phase === "leavingDate" ||
    phase === "walkingDinner" ||
    phase === "walkingActivity" ||
    phase === "walkingDrinks"
  );
}

function getTargetProgress(phase: JourneyPhase) {
  if (phase === "prologue" || phase === "transition" || phase === "introBrief") {
    return 0;
  }

  if (phase === "walkingDate" || phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate") {
    return STOP_PROGRESS.date;
  }

  if (phase === "leavingDate") {
    return 0.36;
  }

  if (phase === "walkingDinner" || phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner") {
    return STOP_PROGRESS.dinner;
  }

  if (phase === "walkingActivity" || phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity") {
    return STOP_PROGRESS.activity;
  }

  return STOP_PROGRESS.drinks;
}

function getPhaseSpeed(phase: JourneyPhase) {
  if (phase === "walkingDate") {
    return 0.0165;
  }

  if (phase === "leavingDate") {
    return 0.0145;
  }

  if (phase === "walkingDinner") {
    return 0.0135;
  }

  if (phase === "walkingActivity") {
    return 0.0126;
  }

  if (phase === "walkingDrinks") {
    return 0.0112;
  }

  return 0.01;
}

function AssetGate({ onReady }: { onReady?: () => void }) {
  const { active, progress } = useProgress();
  const firedRef = useRef(false);

  useEffect(() => {
    if (!onReady || active || progress < 100 || firedRef.current) {
      return;
    }

    firedRef.current = true;
    const id = window.setTimeout(() => {
      onReady();
    }, 60);

    return () => {
      window.clearTimeout(id);
    };
  }, [active, onReady, progress]);

  return null;
}

function JourneyRig({
  curve,
  onArrive,
  pairRigRef,
  phase,
  progressRef
}: {
  curve: THREE.CatmullRomCurve3;
  onArrive: (stop: JourneyStop) => void;
  pairRigRef: React.MutableRefObject<THREE.Group | null>;
  phase: JourneyPhase;
  progressRef: React.MutableRefObject<number>;
}) {
  const arrivalRef = useRef({
    activity: false,
    date: false,
    dinner: false,
    drinks: false
  });

  useEffect(() => {
    if (phase === "prologue" || phase === "transition" || phase === "introBrief") {
      progressRef.current = 0;
      arrivalRef.current = {
        activity: false,
        date: false,
        dinner: false,
        drinks: false
      };
    }

    if (phase === "walkingDate") {
      arrivalRef.current.date = false;
    }

    if (phase === "walkingDinner") {
      arrivalRef.current.dinner = false;
    }

    if (phase === "walkingActivity") {
      arrivalRef.current.activity = false;
    }

    if (phase === "walkingDrinks") {
      arrivalRef.current.drinks = false;
    }
  }, [phase, progressRef]);

  useFrame((_, delta) => {
    const pair = pairRigRef.current;

    if (!pair) {
      return;
    }

    const activeStop = vectorForPhase(phase);
    const targetProgress = getTargetProgress(phase);

    if (isWalkingPhase(phase)) {
      progressRef.current = Math.min(targetProgress, progressRef.current + delta * getPhaseSpeed(phase));
    } else {
      progressRef.current = THREE.MathUtils.damp(progressRef.current, targetProgress, 3.2, delta);
    }

    const point = curve.getPoint(progressRef.current);
    const tangent = curve.getTangent(Math.min(progressRef.current + 0.008, 1)).normalize();
    const walkYaw = Math.atan2(tangent.x, tangent.z);
    const focus = activeStop ? STOP_FOCUS[activeStop] : point.clone().add(tangent.clone().multiplyScalar(8));
    const focusYaw = Math.atan2(focus.x - point.x, focus.z - point.z);

    pair.position.copy(point);
    pair.rotation.y = THREE.MathUtils.damp(
      pair.rotation.y,
      activeStop ? focusYaw : walkYaw,
      activeStop ? 4.4 : 5.1,
      delta
    );

    if (phase === "walkingDate" && progressRef.current >= STOP_PROGRESS.date - 0.002 && !arrivalRef.current.date) {
      arrivalRef.current.date = true;
      onArrive("date");
    }

    if (phase === "walkingDinner" && progressRef.current >= STOP_PROGRESS.dinner - 0.002 && !arrivalRef.current.dinner) {
      arrivalRef.current.dinner = true;
      onArrive("dinner");
    }

    if (phase === "walkingActivity" && progressRef.current >= STOP_PROGRESS.activity - 0.002 && !arrivalRef.current.activity) {
      arrivalRef.current.activity = true;
      onArrive("activity");
    }

    if (phase === "walkingDrinks" && progressRef.current >= STOP_PROGRESS.drinks - 0.002 && !arrivalRef.current.drinks) {
      arrivalRef.current.drinks = true;
      onArrive("drinks");
    }
  });

  return null;
}

function CameraDirector({
  curve,
  mobileView,
  pairRigRef,
  phase,
  progressRef
}: {
  curve: THREE.CatmullRomCurve3;
  mobileView: boolean;
  pairRigRef: React.MutableRefObject<THREE.Group | null>;
  phase: JourneyPhase;
  progressRef: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const settledLook = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const sideVector = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const pair = pairRigRef.current;

    if (!pair) {
      return;
    }

    const activeStop = vectorForPhase(phase);
    const pairPosition = pair.position;
    const progress = progressRef.current;
    const tangent = curve.getTangent(Math.min(progress + 0.008, 1)).normalize();
    sideVector.crossVectors(up, tangent).normalize();

    const sway = Math.sin(state.clock.elapsedTime * 0.34) * 0.05;
    const lift = Math.sin(state.clock.elapsedTime * 0.52) * 0.03;

    if (phase === "transition" || phase === "introBrief") {
      desiredPosition.set(-2.3, mobileView ? 3.7 : 4.3, 24.6);
      desiredLook.set(0.2, 1.4, 7.6);
    } else if (activeStop) {
      if (activeStop === "date" && mobileView) {
        if (phase === "arrivedDate") {
          desiredPosition.set(
            pairPosition.x - 3.1,
            pairPosition.y + 2.5,
            pairPosition.z + 5.1
          );
          desiredLook.set(
            pairPosition.x + 0.22,
            pairPosition.y + 1.1,
            pairPosition.z - 0.6
          );
        } else {
          desiredPosition.set(
            pairPosition.x - 3.1,
            pairPosition.y + 3.15,
            pairPosition.z + 6.8
          );
          desiredLook.set(STOP_FOCUS.date.x - 0.24, pairPosition.y + 1.2, STOP_FOCUS.date.z - 0.54);
        }
      } else if (activeStop === "activity") {
        desiredPosition.set(
          pairPosition.x + (mobileView ? 3.8 : 4.8),
          pairPosition.y + (mobileView ? 6.2 : 6.8),
          pairPosition.z + (mobileView ? 11.6 : 13.2)
        );
        desiredLook.copy(STOP_FOCUS.activity);
      } else if (activeStop === "drinks") {
        desiredPosition.set(
          pairPosition.x - (mobileView ? 5.2 : 3.8),
          pairPosition.y + (mobileView ? 3.0 : 2.6),
          pairPosition.z + (mobileView ? 10.1 : 6.4)
        );
        desiredLook.set(pairPosition.x + (mobileView ? 0.45 : 0.9), pairPosition.y + (mobileView ? 1.36 : 1.2), pairPosition.z - (mobileView ? 10.8 : 11.2));

        if (phase === "finalReveal" || phase === "submitted") {
          desiredPosition.set(
            pairPosition.x - (mobileView ? 5.6 : 4.4),
            pairPosition.y + (mobileView ? 3.4 : 3.1),
            pairPosition.z + (mobileView ? 11.1 : 7.4)
          );
          desiredLook.set(pairPosition.x + (mobileView ? 0.6 : 1.2), pairPosition.y + (mobileView ? 1.44 : 1.4), pairPosition.z - (mobileView ? 11.8 : 13.8));
        }
      } else {
        desiredPosition.copy(STOP_CAMERA[activeStop]);
        desiredLook.copy(STOP_FOCUS[activeStop]);
      }
    } else {
      if (phase === "walkingDrinks") {
        desiredPosition.set(
          pairPosition.x - (mobileView ? 4.8 : 2.8),
          pairPosition.y + (mobileView ? 3.8 : 5),
          pairPosition.z + (mobileView ? 8.9 : 6.8)
        );
        desiredLook.copy(STOP_FOCUS.drinks).lerp(pairPosition, mobileView ? 0.34 : 0.18).add(new THREE.Vector3(0, mobileView ? 0.2 : -0.3, 0));
      } else if (phase === "walkingActivity") {
        desiredPosition.set(
          pairPosition.x + (mobileView ? 1.7 : 2.3),
          pairPosition.y + (mobileView ? 3.4 : 4.2),
          pairPosition.z + (mobileView ? 5.9 : 7.2)
        );
        desiredLook.set(pairPosition.x - 0.8, pairPosition.y + 1.25, pairPosition.z - 8.2);
      } else if (phase === "walkingDinner") {
        desiredPosition.set(
          pairPosition.x - (mobileView ? 1.9 : 2.5),
          pairPosition.y + (mobileView ? 3.1 : 3.9),
          pairPosition.z + (mobileView ? 5.8 : 7.1)
        );
        desiredLook.set(pairPosition.x + 0.45, pairPosition.y + 1.18, pairPosition.z - 7.4);
      } else {
        desiredPosition.set(
          pairPosition.x - (mobileView ? 1.35 : 1.85),
          pairPosition.y + (mobileView ? 2.7 : 3.4),
          pairPosition.z + (mobileView ? 5.2 : 6.6)
        );
        desiredLook.set(pairPosition.x + 0.35, pairPosition.y + 1.08, pairPosition.z - 6.8);
      }
    }

    desiredPosition.x += sway;
    desiredPosition.y += lift;

    perspectiveCamera.position.x = THREE.MathUtils.damp(perspectiveCamera.position.x, desiredPosition.x, 3.6, delta);
    perspectiveCamera.position.y = THREE.MathUtils.damp(perspectiveCamera.position.y, desiredPosition.y, 3.6, delta);
    perspectiveCamera.position.z = THREE.MathUtils.damp(perspectiveCamera.position.z, desiredPosition.z, 3.6, delta);

    settledLook.x = THREE.MathUtils.damp(settledLook.x, desiredLook.x, 4.2, delta);
    settledLook.y = THREE.MathUtils.damp(settledLook.y, desiredLook.y, 4.2, delta);
    settledLook.z = THREE.MathUtils.damp(settledLook.z, desiredLook.z, 4.2, delta);

    perspectiveCamera.lookAt(settledLook);

    const targetFov =
      activeStop === "drinks"
        ? mobileView
          ? 44
          : 32
        : activeStop === "activity"
          ? mobileView
            ? 40
            : 38
          : activeStop === "dinner"
            ? mobileView
              ? 42
              : 39
            : activeStop === "date"
              ? mobileView
                ? 46
                : 40
              : mobileView
                ? 47
                : 43;

    perspectiveCamera.fov = THREE.MathUtils.damp(perspectiveCamera.fov, targetFov, 4.4, delta);
    perspectiveCamera.updateProjectionMatrix();
  });

  return null;
}

function WorldPostEffects({ mobileView }: { mobileView: boolean }) {
  const aberrationOffset = useMemo(
    () => new THREE.Vector2(mobileView ? 0.00085 : 0.0018, mobileView ? 0.00045 : 0.0012),
    [mobileView]
  );

  return (
    <EffectComposer multisampling={0}>
      <N8AO
        aoRadius={mobileView ? 1.6 : 2.4}
        aoSamples={mobileView ? 8 : 16}
        color="#120d12"
        denoiseRadius={mobileView ? 6 : 10}
        denoiseSamples={mobileView ? 3 : 4}
        distanceFalloff={1}
        halfRes={mobileView}
        intensity={mobileView ? 0.95 : 1.3}
        quality={mobileView ? "performance" : "medium"}
        screenSpaceRadius
      />
      <Bloom
        intensity={mobileView ? 0.24 : 0.4}
        luminanceSmoothing={0.9}
        luminanceThreshold={0.8}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <HueSaturation saturation={mobileView ? 0.04 : 0.08} />
      <BrightnessContrast brightness={0.01} contrast={mobileView ? 0.05 : 0.08} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
        radialModulation
        modulationOffset={0.52}
      />
      <Vignette darkness={mobileView ? 0.24 : 0.3} eskil={false} offset={0.5} />
    </EffectComposer>
  );
}

export function WorldCanvas({
  onActivityOpen: _onActivityOpen,
  onWorldReady,
  phase,
  selectedActivityId,
  selectedDinnerId,
  selectedDateId: _selectedDateId,
  selectedDrinksId,
  onArrive,
  onBoardOpen: _onBoardOpen,
  onDinnerOpen: _onDinnerOpen,
  onDrinksOpen: _onDrinksOpen,
  transitioning = false
}: WorldCanvasProps) {
  const pairRigRef = useRef<THREE.Group | null>(null);
  const journeyProgressRef = useRef(0);
  const [mobileView, setMobileView] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([...ROUTE_POINTS]), []);
  const dinnerActive =
    phase === "walkingDinner" ||
    phase === "arrivedDinner" ||
    phase === "selectingDinner" ||
    phase === "lockedDinner";
  const activityActive =
    phase === "walkingActivity" ||
    phase === "arrivedActivity" ||
    phase === "selectingActivity" ||
    phase === "lockedActivity";
  const drinksActive =
    phase === "walkingDrinks" ||
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted";

  useEffect(() => {
    function updateViewport() {
      setMobileView(window.innerWidth <= 820 && window.innerHeight >= window.innerWidth);
      setViewportReady(true);
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  if (!viewportReady) {
    return <div className={`world-stage${transitioning ? " world-stage-emerging" : ""}`} />;
  }

  return (
    <div className={`world-stage${transitioning ? " world-stage-emerging" : ""}`}>
      <Canvas
        camera={{ fov: mobileView ? 47 : 43, near: 0.1, far: 320, position: [-2.3, 4.1, 24.6] }}
        dpr={mobileView ? [0.85, 1.05] : [1, 1.35]}
        gl={{
          alpha: false,
          antialias: !mobileView,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
          stencil: false
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.NoToneMapping;
          gl.toneMappingExposure = mobileView ? 0.82 : 0.88;
          gl.setClearColor("#8b6570");
        }}
        performance={{ min: 0.65 }}
        shadows
      >
        <AssetGate onReady={onWorldReady} />
        <color args={["#8d6a74"]} attach="background" />
        <fogExp2 args={["#6f505a", mobileView ? 0.0115 : 0.0102]} attach="fog" />

        <ambientLight intensity={0.64} />
        <hemisphereLight args={["#ffd1ad", "#4c3440", 0.92]} />
        <directionalLight
          castShadow
          color="#ffd4ab"
          intensity={0.96}
          position={[8, 14, 12]}
          shadow-bias={-0.00008}
          shadow-mapSize-height={mobileView ? 512 : 1024}
          shadow-mapSize-width={mobileView ? 512 : 1024}
        />

        <JourneyRig
          curve={curve}
          onArrive={onArrive}
          pairRigRef={pairRigRef}
          phase={phase}
          progressRef={journeyProgressRef}
        />
        <CameraDirector
          curve={curve}
          mobileView={mobileView}
          pairRigRef={pairRigRef}
          phase={phase}
          progressRef={journeyProgressRef}
        />
        <CityScene
          mobileView={mobileView}
          phase={phase}
          selectedActivityId={selectedActivityId}
          selectedDinnerId={selectedDinnerId}
          selectedDrinksId={selectedDrinksId}
        />

        <group position={[0, 0, 18]} ref={pairRigRef} scale={mobileView ? 1.08 : 1.12}>
          <pointLight color="#ffd8af" distance={10} intensity={mobileView ? 0.68 : 0.82} position={[0, 3, 2.2]} />
          <pointLight color="#ffc0a4" distance={8} intensity={mobileView ? 0.24 : 0.36} position={[0.8, 2.2, 1.6]} />

          <Suspense fallback={null}>
            <CharacterPair
              facingBoard={vectorForPhase(phase) !== null}
              phase={phase}
              walking={isWalkingPhase(phase)}
            />
          </Suspense>
        </group>

        <Suspense fallback={null}>
          <SceneLighting
            mobileView={mobileView}
            phase={phase}
            plazaActive={dinnerActive}
            powerActive={activityActive}
            rooftopActive={drinksActive}
          />
          <Preload all />
        </Suspense>

        <WorldPostEffects mobileView={mobileView} />
      </Canvas>

      <div className="world-vignette" />
      <div className="world-gradient" />
    </div>
  );
}
