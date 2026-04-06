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

type WorldCanvasProps = {
  onActivityOpen: () => void;
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

  const reducedDetail = transitioning || phase === "introBrief" || isPhonePortrait;

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
        dpr={reducedDetail ? [1, 1] : [1, 1.18]}
        gl={{ alpha: false, antialias: !isPhonePortrait, powerPreference: "high-performance", stencil: false }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.85;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        shadows
      >
        <fogExp2 args={["#2a1a2e", 0.02]} attach="fog" />

        <Suspense fallback={null}>
          <DuskSkybox />
          <SceneLighting phase={phase} plazaActive={plazaActive} powerActive={powerActive} rooftopActive={rooftopActive} />
          <StreetcarSegment plazaActive={plazaActive} reducedDetail={reducedDetail} />
          {plazaActive ? <PlazaSegment active={plazaActive} reducedDetail={reducedDetail} selectedDinnerId={selectedDinnerId} /> : null}
          {powerActive ? <PowerLightSegment active={powerActive} reducedDetail={reducedDetail} selectedActivityId={selectedActivityId} /> : null}
          {rooftopActive ? <RooftopSegment active={rooftopActive} phase={phase} reducedDetail={reducedDetail} selectedDrinksId={selectedDrinksId} /> : null}

          <group position={[0.12, 0, 14]} ref={pairRigRef} scale={1.22}>
            <pointLight color="#ffc995" distance={8.4} intensity={0.58} position={[0, 2.9, 2.8]} />
            <pointLight color="#83a6d3" distance={10} intensity={0.16} position={[0, 3.2, -2.4]} />
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
          </group>

          <RouteController onArrive={onArrive} pairRigRef={pairRigRef} phase={phase} />
          <CameraRig activeStop={activeStop} lookBiasRef={lookBiasRef} pairRigRef={pairRigRef} phase={phase} />

          <DateBoard active={boardActive} onOpen={onBoardOpen} selectedLabel={selectedDate?.shortLabel ?? null} />
          {plazaActive ? <DinnerCue active={dinnerActive} onOpen={onDinnerOpen} selectedLabel={selectedDinner?.label ?? null} /> : null}
          {powerActive ? <ActivityCue active={activityActive} onOpen={onActivityOpen} selectedLabel={selectedActivity?.label ?? null} /> : null}
          {rooftopActive ? <DrinksCue active={drinksActive} onOpen={onDrinksOpen} selectedLabel={selectedDrinks?.label ?? null} /> : null}
          <WorldPostProcessing reducedDetail={reducedDetail} />
        </Suspense>
      </Canvas>

      <div className="world-vignette" />
      <div className="world-gradient" />
    </div>
  );
}
