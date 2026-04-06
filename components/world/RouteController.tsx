"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { routePoints, stopProgress } from "@/lib/routeConfig";

export type JourneyStop = "date" | "dinner" | "activity" | "drinks";

export type JourneyPhase =
  | "prologue"
  | "transition"
  | "introBrief"
  | "walkingDate"
  | "arrivedDate"
  | "selectingDate"
  | "lockedDate"
  | "leavingDate"
  | "walkingDinner"
  | "arrivedDinner"
  | "selectingDinner"
  | "lockedDinner"
  | "walkingActivity"
  | "arrivedActivity"
  | "selectingActivity"
  | "lockedActivity"
  | "walkingDrinks"
  | "arrivedDrinks"
  | "selectingDrinks"
  | "lockedDrinks"
  | "finalReveal"
  | "submitted";

type RouteControllerProps = {
  phase: JourneyPhase;
  pairRigRef: React.MutableRefObject<THREE.Group | null>;
  onArrive: (stop: JourneyStop) => void;
};

const STROLL_PROGRESS_SPEEDS = {
  date: 0.045,
  leaveDate: 0.03,
  dinner: 0.038,
  activity: 0.036,
  drinks: 0.026
} as const;

export function RouteController({ phase, pairRigRef, onArrive }: RouteControllerProps) {
  const progressRef = useRef(0);
  const dateArrivedRef = useRef(false);
  const dinnerArrivedRef = useRef(false);
  const activityArrivedRef = useRef(false);
  const drinksArrivedRef = useRef(false);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(routePoints.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    []
  );
  const activityLookRef = useRef(new THREE.Vector3(-1.1, 2.64, -109.4));
  const rooftopLookRef = useRef(new THREE.Vector3(6.34, 6.28, -149.6));

  useEffect(() => {
    if (phase === "prologue" || phase === "transition" || phase === "introBrief") {
      progressRef.current = 0;
      dateArrivedRef.current = false;
      dinnerArrivedRef.current = false;
      activityArrivedRef.current = false;
      drinksArrivedRef.current = false;
    }

    if (phase === "walkingDate") {
      dateArrivedRef.current = false;
    }

    if (phase === "walkingDinner") {
      dinnerArrivedRef.current = false;
    }

    if (phase === "walkingActivity") {
      activityArrivedRef.current = false;
    }

    if (phase === "walkingDrinks") {
      drinksArrivedRef.current = false;
    }
  }, [phase]);

  useFrame((_, delta) => {
    const targetProgress =
      phase === "prologue" || phase === "transition" || phase === "introBrief"
        ? 0
        : phase === "walkingDate" || phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate"
          ? stopProgress.date
          : phase === "leavingDate"
            ? Math.min(stopProgress.dinner, stopProgress.date + 0.17)
            : phase === "walkingDinner" || phase === "arrivedDinner" || phase === "selectingDinner" || phase === "lockedDinner"
            ? stopProgress.dinner
            : phase === "walkingActivity" || phase === "arrivedActivity" || phase === "selectingActivity" || phase === "lockedActivity"
              ? stopProgress.activity
              : phase === "walkingDrinks" || phase === "arrivedDrinks" || phase === "selectingDrinks" || phase === "lockedDrinks" || phase === "finalReveal" || phase === "submitted"
                ? stopProgress.drinks
            : stopProgress.outro;
    const shouldMove =
      phase === "walkingDate" || phase === "leavingDate" || phase === "walkingDinner" || phase === "walkingActivity" || phase === "walkingDrinks";
    const speed =
      phase === "walkingDrinks"
        ? STROLL_PROGRESS_SPEEDS.drinks
        : phase === "walkingActivity"
          ? STROLL_PROGRESS_SPEEDS.activity
          : phase === "walkingDinner"
          ? STROLL_PROGRESS_SPEEDS.dinner
          : phase === "leavingDate"
            ? STROLL_PROGRESS_SPEEDS.leaveDate
            : STROLL_PROGRESS_SPEEDS.date;

    if (shouldMove) {
      progressRef.current = Math.min(targetProgress, progressRef.current + delta * speed);
    } else {
      progressRef.current = THREE.MathUtils.damp(progressRef.current, targetProgress, 4.4, delta);
    }

    if (!pairRigRef.current) {
      return;
    }

    const point = curve.getPoint(progressRef.current);
    const tangent = curve.getTangent(Math.min(progressRef.current + 0.01, 1));
    const yaw = Math.atan2(tangent.x, tangent.z);
    const activityMoment =
      phase === "arrivedActivity" ||
      phase === "selectingActivity" ||
      phase === "lockedActivity";
    const rooftopMoment =
      phase === "arrivedDrinks" ||
      phase === "selectingDrinks" ||
      phase === "lockedDrinks" ||
      phase === "finalReveal" ||
      phase === "submitted";
    const rooftopYaw = Math.atan2(
      rooftopLookRef.current.x - point.x,
      rooftopLookRef.current.z - point.z
    );
    const activityYaw = Math.atan2(
      activityLookRef.current.x - point.x,
      activityLookRef.current.z - point.z
    );

    pairRigRef.current.position.copy(point);
    pairRigRef.current.rotation.y = THREE.MathUtils.damp(
      pairRigRef.current.rotation.y,
      rooftopMoment ? rooftopYaw : activityMoment ? activityYaw : yaw,
      rooftopMoment || activityMoment ? 4.2 : 5.4,
      delta
    );

    if (progressRef.current >= stopProgress.date - 0.002 && phase === "walkingDate" && !dateArrivedRef.current) {
      dateArrivedRef.current = true;
      onArrive("date");
    }

    if (progressRef.current >= stopProgress.dinner - 0.002 && phase === "walkingDinner" && !dinnerArrivedRef.current) {
      dinnerArrivedRef.current = true;
      onArrive("dinner");
    }

    if (progressRef.current >= stopProgress.activity - 0.002 && phase === "walkingActivity" && !activityArrivedRef.current) {
      activityArrivedRef.current = true;
      onArrive("activity");
    }

    if (progressRef.current >= stopProgress.drinks - 0.002 && phase === "walkingDrinks" && !drinksArrivedRef.current) {
      drinksArrivedRef.current = true;
      onArrive("drinks");
    }
  });

  return null;
}
