"use client";

import { useEffect, useMemo, useRef } from "react";

import { activityOptions } from "@/lib/activityOptions";
import { dateOptions } from "@/lib/dateOptions";
import { dinnerOptions } from "@/lib/dinnerOptions";
import { drinksOptions } from "@/lib/drinksOptions";
import { MobileCharacterStage } from "@/components/world/MobileCharacterStage";
import type { JourneyPhase, JourneyStop } from "@/components/world/RouteController";

const ARRIVAL_DELAYS: Record<JourneyStop, number> = {
  activity: 6200,
  date: 6200,
  dinner: 5600,
  drinks: 7000
};

function sceneForPhase(phase: JourneyPhase) {
  if (
    phase === "walkingDrinks" ||
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted"
  ) {
    return "rooftop";
  }

  if (phase === "walkingActivity" || phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity") {
    return "activity";
  }

  if (
    phase === "walkingDinner" ||
    phase === "arrivedDinner" ||
    phase === "selectingDinner" ||
    phase === "lockedDinner" ||
    phase === "leavingDate"
  ) {
    return "plaza";
  }

  return "main";
}

function MobileAvatar({
  dress = false,
  hair = "#161218",
  skin = "#8f5d45",
  suit = "#f4f1ee"
}: {
  dress?: boolean;
  hair?: string;
  skin?: string;
  suit?: string;
}) {
  return (
    <div className={`mobile-avatar${dress ? " mobile-avatar-dress" : ""}`}>
      <div className="mobile-avatar-shadow" />
      <div className="mobile-avatar-head" style={{ background: skin }}>
        <div className="mobile-avatar-hair" style={{ background: hair }} />
        <div className="mobile-avatar-face" style={{ background: skin }} />
        <div className="mobile-avatar-eye mobile-avatar-eye-left" />
        <div className="mobile-avatar-eye mobile-avatar-eye-right" />
        <div className="mobile-avatar-smile" />
      </div>
      <div
        className={`mobile-avatar-body${dress ? " mobile-avatar-body-dress" : ""}`}
        style={{
          background: dress
            ? "linear-gradient(180deg, #1a151d 0%, #060608 100%)"
            : `linear-gradient(180deg, ${suit} 0%, #e6ddd6 100%)`
        }}
      >
        {!dress ? (
          <>
            <div className="mobile-avatar-lapel" />
            <div className="mobile-avatar-tie" />
          </>
        ) : null}
      </div>
    </div>
  );
}

function MobileCouple({
  phase
}: {
  phase: JourneyPhase;
}) {
  const roseMoment = phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate";
  const handHolding =
    phase === "lockedDate" ||
    phase === "leavingDate" ||
    phase === "walkingDinner" ||
    phase === "arrivedDinner" ||
    phase === "selectingDinner" ||
    phase === "lockedDinner" ||
    phase === "walkingActivity" ||
    phase === "arrivedActivity" ||
    phase === "selectingActivity" ||
    phase === "lockedActivity" ||
    phase === "walkingDrinks";
  const holdingDrinks = phase === "lockedDrinks" || phase === "finalReveal" || phase === "submitted";
  const skylineMoment =
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted";
  const activityMoment = phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity";
  const scene = sceneForPhase(phase);

  return (
    <div
      className={`mobile-couple mobile-couple-${scene}${roseMoment ? " mobile-couple-rose" : ""}${
        handHolding ? " mobile-couple-handholding" : ""
      }${activityMoment ? " mobile-couple-activity" : ""}${skylineMoment ? " mobile-couple-skyline" : ""}`}
    >
      <div className="mobile-couple-person mobile-couple-dijon">
        <MobileAvatar hair="#101117" skin="#704531" suit="#f5f2ef" />
      </div>

      <div className="mobile-rose-track">
        <div className={`mobile-rose${roseMoment ? " mobile-rose-handoff" : ""}${handHolding ? " mobile-rose-received" : ""}`}>
          <span className="mobile-rose-stem" />
          <span className="mobile-rose-leaf" />
          <span className="mobile-rose-bloom mobile-rose-bloom-a" />
          <span className="mobile-rose-bloom mobile-rose-bloom-b" />
          <span className="mobile-rose-bloom mobile-rose-bloom-c" />
        </div>
      </div>

      <div className={`mobile-joined-hands${handHolding ? " mobile-joined-hands-visible" : ""}`} />

      <div className="mobile-couple-person mobile-couple-madison">
        <MobileAvatar dress hair="#17131b" skin="#b67d59" />
      </div>

      {holdingDrinks ? (
        <>
          <div className="mobile-drink mobile-drink-left" />
          <div className="mobile-drink mobile-drink-right" />
        </>
      ) : null}
    </div>
  );
}

type MobileWorldJourneyProps = {
  onArrive: (stop: JourneyStop) => void;
  onWorldReady?: () => void;
  phase: JourneyPhase;
  selectedActivityId: string | null;
  selectedDinnerId: string | null;
  selectedDateId: string | null;
  selectedDrinksId: string | null;
};

export function MobileWorldJourney({
  onArrive,
  onWorldReady,
  phase,
  selectedActivityId,
  selectedDinnerId,
  selectedDateId,
  selectedDrinksId
}: MobileWorldJourneyProps) {
  const arrivalGuardRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      onWorldReady?.();
    });

    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [onWorldReady]);

  useEffect(() => {
    let stop: JourneyStop | null = null;

    if (phase === "walkingDate") {
      stop = "date";
    } else if (phase === "walkingDinner") {
      stop = "dinner";
    } else if (phase === "walkingActivity") {
      stop = "activity";
    } else if (phase === "walkingDrinks") {
      stop = "drinks";
    }

    if (!stop) {
      return undefined;
    }

    const guardKey = `${phase}-${stop}`;

    if (arrivalGuardRef.current[guardKey]) {
      return undefined;
    }

    arrivalGuardRef.current[guardKey] = true;

    const timeoutId = window.setTimeout(() => {
      onArrive(stop);
    }, ARRIVAL_DELAYS[stop]);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onArrive, phase]);

  const selectedDate = useMemo(
    () => dateOptions.find((option) => option.id === selectedDateId) ?? null,
    [selectedDateId]
  );
  const selectedDinner = useMemo(
    () => dinnerOptions.find((option) => option.id === selectedDinnerId) ?? null,
    [selectedDinnerId]
  );
  const selectedActivity = useMemo(
    () => activityOptions.find((option) => option.id === selectedActivityId) ?? null,
    [selectedActivityId]
  );
  const selectedDrinks = useMemo(
    () => drinksOptions.find((option) => option.id === selectedDrinksId) ?? null,
    [selectedDrinksId]
  );

  const introWorld = phase === "introBrief";
  const showMainScene = phase !== "prologue" && phase !== "transition";
  const mainStrong =
    phase === "walkingDate" ||
    phase === "arrivedDate" ||
    phase === "selectingDate" ||
    phase === "lockedDate" ||
    phase === "leavingDate";
  const plazaStrong = phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner";
  const activityStrong = phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity";
  const rooftopStrong =
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted";
  const plazaVisible =
    plazaStrong || phase === "leavingDate" || phase === "walkingDinner" || phase === "walkingActivity";
  const plazaPrewarm = phase === "leavingDate" || phase === "walkingDinner" || phase === "walkingActivity";
  const showPlazaCue =
    phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner";
  const activityVisible =
    activityStrong || phase === "lockedDinner" || phase === "walkingActivity" || phase === "walkingDrinks";
  const activityPrewarm = phase === "lockedDinner" || phase === "walkingActivity" || phase === "walkingDrinks";
  const showActivityCue =
    phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity";
  const rooftopVisible = rooftopStrong || phase === "lockedActivity" || phase === "walkingDrinks";
  const rooftopPrewarm = phase === "lockedActivity" || phase === "walkingDrinks";
  const showRooftopCue =
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted";

  return (
    <div className={`mobile-world-journey mobile-world-phase-${phase}`}>
      <div className="mobile-world-sky mobile-world-sky-main" />
      <div
        className={`mobile-scene-layer mobile-scene-main${showMainScene ? " mobile-scene-visible" : ""}${
          introWorld ? " mobile-scene-intro" : ""
        }${mainStrong ? " mobile-scene-hero" : ""}`}
      >
        <img alt="" className="mobile-scene-image" src="/world/main-street-night.svg" />
        <div className="mobile-scene-road mobile-scene-road-main" />
        <div className="mobile-scene-rails" />
        <div className="mobile-scene-lamps" />
        <div className="mobile-scene-lamps mobile-scene-lamps-right" />
      </div>

      <div
        className={`mobile-scene-layer mobile-scene-plaza${plazaVisible ? " mobile-scene-visible" : ""}${
          plazaPrewarm ? " mobile-scene-prewarm" : ""
        }${plazaStrong ? " mobile-scene-hero" : ""}`}
      >
        <div className="mobile-world-sky mobile-world-sky-plaza" />
        <img alt="" className="mobile-scene-image" src="/world/plaza-courtyard-night.svg" />
        <div className="mobile-scene-road mobile-scene-road-plaza" />
        <div className="mobile-plaza-tables">
          <span />
          <span />
          <span />
        </div>
        <div className="mobile-plaza-glow" />
        {showPlazaCue ? (
          <div className="mobile-scene-cue mobile-scene-cue-plaza">
            <span>Dinner district</span>
            <strong>{selectedDinner?.shortLabel ?? "Terrace lights ahead"}</strong>
          </div>
        ) : null}
      </div>

      <div
        className={`mobile-scene-layer mobile-scene-activity${activityVisible ? " mobile-scene-visible" : ""}${
          activityPrewarm ? " mobile-scene-prewarm" : ""
        }${activityStrong ? " mobile-scene-hero" : ""}`}
      >
        <div className="mobile-world-sky mobile-world-sky-activity" />
        <img alt="" className="mobile-scene-image" src="/world/power-light-soul-stage.svg" />
        <div className="mobile-stage-room" />
        <div className="mobile-stage-band">
          <span className="mobile-stage-performer mobile-stage-singer" />
          <span className="mobile-stage-performer mobile-stage-guitar" />
          <span className="mobile-stage-performer mobile-stage-drums" />
        </div>
        {showActivityCue ? (
          <div className="mobile-scene-cue mobile-scene-cue-activity">
            <span>Power &amp; Light</span>
            <strong>{selectedActivity?.shortLabel ?? "The live set is starting"}</strong>
          </div>
        ) : null}
      </div>

      <div
        className={`mobile-scene-layer mobile-scene-rooftop${rooftopVisible ? " mobile-scene-visible" : ""}${
          rooftopPrewarm ? " mobile-scene-prewarm" : ""
        }${rooftopStrong ? " mobile-scene-hero" : ""}`}
      >
        <div className="mobile-world-sky mobile-world-sky-rooftop" />
        <div className="mobile-rooftop-stars" />
        <div className="mobile-rooftop-haze" />
        <div className="mobile-rooftop-skyline" />
        <div className="mobile-rooftop-deck" />
        <div className="mobile-rooftop-rail" />
        <div className="mobile-rooftop-table" />
        {showRooftopCue ? (
          <div className="mobile-scene-cue mobile-scene-cue-rooftop">
            <span>Rooftop finale</span>
            <strong>{selectedDrinks?.shortLabel ?? "The skyline is waiting"}</strong>
          </div>
        ) : null}
      </div>

      <div className="mobile-world-glow mobile-world-glow-left" />
      <div className="mobile-world-glow mobile-world-glow-right" />
      <div className="mobile-world-waterline" />
      <div className="mobile-world-petals" />
      <MobileCharacterStage phase={phase} scene={sceneForPhase(phase)} />
    </div>
  );
}
