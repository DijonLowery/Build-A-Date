"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { CameraRig } from "@/components/world/CameraRig";
import { ActivityCue } from "@/components/world/ActivityCue";
import { CharacterPair } from "@/components/world/CharacterPair";
import { DateBoard } from "@/components/world/DateBoard";
import { DinnerCue } from "@/components/world/DinnerCue";
import { DrinksCue } from "@/components/world/DrinksCue";
import { DuskSkybox } from "@/components/world/DuskSkybox";
import { PlazaSegment } from "@/components/world/PlazaSegment";
import { PowerLightSegment } from "@/components/world/PowerLightSegment";
import { RouteController, type JourneyPhase, type JourneyStop } from "@/components/world/RouteController";
import { RooftopSegment } from "@/components/world/RooftopSegment";
import { SceneLighting } from "@/components/world/SceneLighting";
import { StreetcarSegment } from "@/components/world/StreetcarSegment";
import { WorldPostProcessing } from "@/components/world/WorldPostProcessing";
import { activityOptions } from "@/lib/activityOptions";
import { dateOptions } from "@/lib/dateOptions";
import { dinnerOptions } from "@/lib/dinnerOptions";
import { drinksOptions } from "@/lib/drinksOptions";

function MobileHorizonBackdrop() {
  return (
    <group>
      <mesh position={[0, 18, -92]}>
        <planeGeometry args={[220, 96]} />
        <meshBasicMaterial color="#61506f" />
      </mesh>
      <mesh position={[0, 8.5, -88]}>
        <planeGeometry args={[210, 34]} />
        <meshBasicMaterial color="#cc9072" opacity={0.24} transparent />
      </mesh>
      <mesh position={[0, 3.4, -82]}>
        <planeGeometry args={[200, 16]} />
        <meshBasicMaterial color="#f1c09b" opacity={0.12} transparent />
      </mesh>
    </group>
  );
}

function WorldReadySignal({ onReady }: { onReady: () => void }) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) {
      return;
    }

    sentRef.current = true;
    onReady();
  }, [onReady]);

  return null;
}

function MobileStreetBase() {
  return (
    <group position={[0, -0.01, -12]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.4, 86]} />
        <meshStandardMaterial color="#5a4347" roughness={0.74} metalness={0.08} />
      </mesh>

      {[-6.52, 6.52].map((x) => (
        <mesh key={x} position={[x, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.82, 86]} />
          <meshStandardMaterial color="#938b8d" roughness={0.92} />
        </mesh>
      ))}

      {[-0.86, 0.86].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 0.05, -6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 72, 12]} />
          <meshStandardMaterial color="#a0a2aa" metalness={0.52} roughness={0.26} />
        </mesh>
      ))}
    </group>
  );
}

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

export function WorldCanvas({
  onActivityOpen,
  onWorldReady,
  phase,
  selectedActivityId,
  selectedDateId,
  selectedDinnerId,
  selectedDrinksId,
  onArrive,
  onBoardOpen,
  onDinnerOpen,
  onDrinksOpen,
  transitioning = false
}: WorldCanvasProps) {
  const lookBiasRef = useRef({ x: 0, y: 0 });
  const pairRigRef = useRef<THREE.Group | null>(null);
  const [isPhonePortrait, setIsPhonePortrait] = useState(false);
  const [worldAssetsReady, setWorldAssetsReady] = useState(false);

  useEffect(() => {
    function updateViewportFlags() {
      setIsPhonePortrait(window.innerWidth <= 768 && window.innerHeight > window.innerWidth);
    }

    updateViewportFlags();
    window.addEventListener("resize", updateViewportFlags);

    return () => {
      window.removeEventListener("resize", updateViewportFlags);
    };
  }, []);

  useEffect(() => {
    if (phase === "transition") {
      lookBiasRef.current = { x: 0, y: 0 };
    }
  }, [phase]);

  useEffect(() => {
    if (!isPhonePortrait || worldAssetsReady) {
      return;
    }

    setWorldAssetsReady(true);
    onWorldReady?.();
  }, [isPhonePortrait, onWorldReady, worldAssetsReady]);

  const mobileTransitionLite =
    isPhonePortrait &&
    (phase === "walkingDinner" || phase === "walkingActivity" || phase === "walkingDrinks");
  const reducedDetail =
    phase === "introBrief" ||
    (transitioning && !worldAssetsReady) ||
    mobileTransitionLite;

  const selectedDate = dateOptions.find((option) => option.id === selectedDateId) ?? null;
  const selectedDinner = dinnerOptions.find((option) => option.id === selectedDinnerId) ?? null;
  const selectedActivity = activityOptions.find((option) => option.id === selectedActivityId) ?? null;
  const selectedDrinks = drinksOptions.find((option) => option.id === selectedDrinksId) ?? null;
  const boardActive = phase === "arrivedDate" || phase === "selectingDate";
  const dinnerActive = phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner";
  const activityActive = phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity";
  const drinksActive = phase === "arrivedDrinks" || phase === "selectingDrinks" || phase === "lockedDrinks" || phase === "finalReveal" || phase === "submitted";
  const plazaActive =
    phase === "leavingDate" || phase === "walkingDinner" || phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner" || phase === "walkingActivity" || phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity";
  const powerActive =
    phase === "walkingActivity" || phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity";
  const rooftopActive = phase === "walkingDrinks" || phase === "arrivedDrinks" || phase === "selectingDrinks" || phase === "lockedDrinks" || phase === "finalReveal" || phase === "submitted";
  const activeStop: JourneyStop | null =
    phase === "arrivedDrinks" || phase === "selectingDrinks" || phase === "lockedDrinks" || phase === "finalReveal" || phase === "submitted"
      ? "drinks"
      : phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity"
        ? "activity"
        : phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner"
      ? "dinner"
      : phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate"
        ? "date"
        : null;
  const plazaMounted = phase === "selectingDate" || phase === "lockedDate" || plazaActive;
  const powerMounted = phase === "selectingDinner" || phase === "lockedDinner" || powerActive;
  const rooftopMounted = phase === "selectingActivity" || phase === "lockedActivity" || rooftopActive;

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    lookBiasRef.current = {
      x: THREE.MathUtils.clamp(x, -1, 1),
      y: THREE.MathUtils.clamp(-y, -1, 1)
    };
  }

  function handlePointerLeave() {
    lookBiasRef.current = { x: 0, y: 0 };
  }

  return (
    <div
      className={`world-stage${transitioning ? " world-stage-emerging" : ""}`}
      onPointerLeave={handlePointerLeave}
      onPointerMove={reducedDetail ? undefined : handlePointerMove}
    >
      <Canvas
        camera={{ fov: 41, near: 0.1, far: 160, position: [0, 3.12, 9.4] }}
        dpr={reducedDetail ? [1, 1] : isPhonePortrait ? [1.18, 1.52] : [1, 1.18]}
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance", stencil: false }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isPhonePortrait ? 1.08 : 0.85;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        shadows
      >
        <fogExp2 args={[isPhonePortrait ? "#5a4360" : "#2a1a2e", isPhonePortrait ? 0.008 : 0.02]} attach="fog" />

        <DuskSkybox mobileView={isPhonePortrait} />
        <RouteController onArrive={onArrive} pairRigRef={pairRigRef} phase={phase} />
        <CameraRig activeStop={activeStop} lookBiasRef={lookBiasRef} pairRigRef={pairRigRef} phase={phase} />

        <group position={[0.12, 0, 14]} ref={pairRigRef} scale={isPhonePortrait ? 1.08 : 1.22}>
          <pointLight color="#ffc995" distance={8.4} intensity={isPhonePortrait ? 1.14 : 0.58} position={[0, 2.9, 2.8]} />
          <pointLight color="#83a6d3" distance={12} intensity={isPhonePortrait ? 0.42 : 0.16} position={[0, 3.2, -2.4]} />
          <Suspense fallback={null}>
            <CharacterPair
              facingBoard={activeStop !== null}
              phase={phase}
              walking={
                phase === "walkingDate" ||
                phase === "leavingDate" ||
                phase === "walkingDinner" ||
                phase === "walkingActivity" ||
                phase === "walkingDrinks"
              }
            />
          </Suspense>
        </group>

        {isPhonePortrait ? (
          <>
            <SceneLighting mobileView={true} phase={phase} plazaActive={plazaActive} powerActive={powerActive} rooftopActive={rooftopActive} />
            <StreetcarSegment phase={phase} plazaActive={plazaActive} reducedDetail={reducedDetail} />
            {plazaMounted ? <PlazaSegment active={plazaActive} reducedDetail={reducedDetail} selectedDinnerId={selectedDinnerId} /> : null}
            {powerMounted ? <PowerLightSegment active={powerActive} reducedDetail={reducedDetail} selectedActivityId={selectedActivityId} /> : null}
            {rooftopMounted ? <RooftopSegment active={rooftopActive} phase={phase} reducedDetail={reducedDetail} selectedDrinksId={selectedDrinksId} /> : null}

            <DateBoard active={boardActive} onOpen={onBoardOpen} selectedLabel={selectedDate?.shortLabel ?? null} />
            {plazaActive ? <DinnerCue active={dinnerActive} onOpen={onDinnerOpen} selectedLabel={selectedDinner?.label ?? null} /> : null}
            {powerActive ? <ActivityCue active={activityActive} onOpen={onActivityOpen} selectedLabel={selectedActivity?.label ?? null} /> : null}
            {rooftopActive ? <DrinksCue active={drinksActive} onOpen={onDrinksOpen} selectedLabel={selectedDrinks?.label ?? null} /> : null}
            <WorldPostProcessing mobileView={true} reducedDetail={reducedDetail} />
          </>
        ) : (
          <Suspense fallback={null}>
            <WorldReadySignal
              onReady={() => {
                setWorldAssetsReady(true);
                onWorldReady?.();
              }}
            />
            <SceneLighting mobileView={false} phase={phase} plazaActive={plazaActive} powerActive={powerActive} rooftopActive={rooftopActive} />
            <StreetcarSegment phase={phase} plazaActive={plazaActive} reducedDetail={reducedDetail} />
            {plazaMounted ? <PlazaSegment active={plazaActive} reducedDetail={reducedDetail} selectedDinnerId={selectedDinnerId} /> : null}
            {powerMounted ? <PowerLightSegment active={powerActive} reducedDetail={reducedDetail} selectedActivityId={selectedActivityId} /> : null}
            {rooftopMounted ? <RooftopSegment active={rooftopActive} phase={phase} reducedDetail={reducedDetail} selectedDrinksId={selectedDrinksId} /> : null}

            <DateBoard active={boardActive} onOpen={onBoardOpen} selectedLabel={selectedDate?.shortLabel ?? null} />
            {plazaActive ? <DinnerCue active={dinnerActive} onOpen={onDinnerOpen} selectedLabel={selectedDinner?.label ?? null} /> : null}
            {powerActive ? <ActivityCue active={activityActive} onOpen={onActivityOpen} selectedLabel={selectedActivity?.label ?? null} /> : null}
            {rooftopActive ? <DrinksCue active={drinksActive} onOpen={onDrinksOpen} selectedLabel={selectedDrinks?.label ?? null} /> : null}
            <WorldPostProcessing mobileView={false} reducedDetail={reducedDetail} />
          </Suspense>
        )}
      </Canvas>

      <div className="world-vignette" />
      <div className="world-gradient" />
    </div>
  );
}
