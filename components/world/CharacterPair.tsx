"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { JourneyPhase } from "@/components/world/RouteController";

type AvatarProps = {
  activityMoment: boolean;
  avatarRef?: MutableRefObject<THREE.Group | null>;
  drinkAccent?: string;
  handHolding: boolean;
  holdingDrink: boolean;
  modelPath: string;
  offset: [number, number, number];
  phase: JourneyPhase;
  facingBoard: boolean;
  roseMoment: boolean;
  skylineMoment: boolean;
  targetHeight: number;
  variant: "dijon" | "madison";
  walking: boolean;
};

const STROLL_TEMPO_BPM = 74;
const STROLL_SWING_SPEED = (STROLL_TEMPO_BPM / 60) * Math.PI;

function DrinkGlass({
  accent,
  position
}: {
  accent: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.055, 0.045, 0.18, 18]} />
        <meshStandardMaterial color="#fff7f2" opacity={0.26} roughness={0.08} transparent />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.043, 0.038, 0.09, 18]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.16} roughness={0.26} />
      </mesh>
      <mesh position={[0, -0.11, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 12]} />
        <meshStandardMaterial color="#dfd1c5" metalness={0.18} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.02, 18]} />
        <meshStandardMaterial color="#dfd1c5" metalness={0.18} roughness={0.32} />
      </mesh>
    </group>
  );
}

function ModelAvatar({
  activityMoment,
  avatarRef,
  drinkAccent = "#d7b08e",
  handHolding,
  holdingDrink,
  modelPath,
  offset,
  phase,
  facingBoard,
  roseMoment,
  skylineMoment,
  targetHeight,
  variant,
  walking
}: AvatarProps) {
  const rootRef = useRef<THREE.Group | null>(null);
  const isMadison = variant === "madison";
  const phaseShift = isMadison ? 0.82 : 0;
  const { gl } = useThree();
  const { scene, animations } = useGLTF(modelPath);
  const model = useMemo(() => clone(scene), [scene]);
  const { actions, names } = useAnimations(animations, model);

  const { anchor, scale } = useMemo(() => {
    const clone = model;
    clone.traverse((child) => {
      if ("castShadow" in child) {
        child.castShadow = true;
      }
      if ("receiveShadow" in child) {
        child.receiveShadow = true;
      }
    });

    const bounds = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    const normalizedHeight = size.y || 1;
    const normalizedScale = targetHeight / normalizedHeight;
    const normalizedAnchor = new THREE.Vector3(center.x, bounds.min.y, center.z);

    return {
      anchor: normalizedAnchor,
      scale: normalizedScale
    };
  }, [model, targetHeight]);

  useEffect(() => {
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 12);

    model.traverse((child) => {
      if (!("material" in child)) {
        return;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];

      materials.forEach((material) => {
        if (!(material instanceof THREE.Material)) {
          return;
        }

        const map = ("map" in material ? material.map : null) as THREE.Texture | null;
        const normalMap = ("normalMap" in material ? material.normalMap : null) as THREE.Texture | null;

        if (map) {
          map.colorSpace = THREE.SRGBColorSpace;
          map.anisotropy = maxAnisotropy;
          map.minFilter = THREE.LinearMipmapLinearFilter;
          map.magFilter = THREE.LinearFilter;
          map.needsUpdate = true;
        }

        if (normalMap) {
          normalMap.anisotropy = maxAnisotropy;
          normalMap.minFilter = THREE.LinearMipmapLinearFilter;
          normalMap.magFilter = THREE.LinearFilter;
          normalMap.needsUpdate = true;
        }

        material.needsUpdate = true;
      });
    });
  }, [gl, model]);

  useEffect(() => {
    const walkClip = names.find((name) => /walk|stroll|stride/i.test(name));
    const idleClip = names.find((name) => /idle|stand|breath|pose/i.test(name));
    const nextClip = walking ? walkClip : idleClip;

    Object.values(actions).forEach((action) => {
      action?.stop();
    });

    if (!nextClip) {
      return;
    }

    const action = actions[nextClip];

    if (!action) {
      return;
    }

    action.reset();
    action.fadeIn(0.28);
    action.play();
    action.timeScale = walking ? 0.86 : 0.62;

    return () => {
      action.fadeOut(0.24);
    };
  }, [actions, names, walking]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() + phaseShift;
    const interactionTurn = roseMoment
      ? isMadison
        ? -0.46
        : 0.4
      : handHolding
        ? isMadison
          ? -0.08
          : 0.08
      : activityMoment
        ? isMadison
          ? -0.24
          : 0.18
        : skylineMoment
          ? isMadison
            ? -0.22
            : 0.18
          : facingBoard
            ? isMadison
              ? -0.15
              : 0.12
            : 0;

    if (!rootRef.current) {
      return;
    }

    const bob = walking ? Math.abs(Math.sin(t * STROLL_SWING_SPEED)) * 0.05 : Math.sin(t * 1.45) * 0.012;
    const targetX = roseMoment
      ? offset[0] + (isMadison ? 0.18 : -0.1)
      : handHolding
        ? offset[0] + (isMadison ? -0.12 : 0.12)
        : offset[0];
    const targetZ = roseMoment
      ? offset[2] + (isMadison ? -0.04 : 0.08)
      : handHolding
        ? offset[2] + 0.05
        : offset[2];

    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, targetX, 5, delta);
    rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, offset[1] + bob, 6, delta);
    rootRef.current.position.z = THREE.MathUtils.damp(rootRef.current.position.z, targetZ, 5, delta);
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, interactionTurn, 5.5, delta);
    rootRef.current.rotation.z = THREE.MathUtils.damp(
      rootRef.current.rotation.z,
      walking ? Math.sin(t * STROLL_SWING_SPEED) * 0.014 : isMadison ? -0.012 : 0.01,
      6,
      delta
    );
  });

  return (
    <group
      position={offset}
      ref={(node) => {
        rootRef.current = node;
        if (avatarRef) {
          avatarRef.current = node;
        }
      }}
    >
      <mesh position={[0, 0.03, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.76, 24]} />
        <meshBasicMaterial color="#000000" opacity={0.16} transparent />
      </mesh>

      <group
        position={[-anchor.x * scale, -anchor.y * scale, -anchor.z * scale]}
        rotation={[0, 0, 0]}
        scale={[scale, scale, scale]}
      >
        <primitive object={model} />
      </group>

      {holdingDrink && skylineMoment ? (
        <DrinkGlass
          accent={drinkAccent}
          position={isMadison ? [0.16, 1.02, 0.26] : [-0.16, 1.08, 0.28]}
        />
      ) : null}
    </group>
  );
}

function Rose({
  phase,
  dijonRef,
  madisonRef
}: {
  phase: JourneyPhase;
  dijonRef: MutableRefObject<THREE.Group | null>;
  madisonRef: MutableRefObject<THREE.Group | null>;
}) {
  const roseRef = useRef<THREE.Group>(null);
  const handoffProgressRef = useRef(0);
  const dijonFallbackRef = useRef(new THREE.Vector3(-0.3, 0.86, 0.16));
  const madisonFallbackRef = useRef(new THREE.Vector3(0.38, 0.82, 0.02));
  const startRef = useRef(new THREE.Vector3());
  const midRef = useRef(new THREE.Vector3());
  const endRef = useRef(new THREE.Vector3());
  const carryRef = useRef(new THREE.Vector3());
  const worldRef = useRef(new THREE.Vector3());

  function getAnchor(
    avatar: THREE.Group | null,
    offset: THREE.Vector3,
    fallback: THREE.Vector3
  ) {
    if (!avatar || !avatar.parent) {
      return fallback.clone();
    }

    worldRef.current.copy(offset);
    avatar.localToWorld(worldRef.current);
    avatar.parent.worldToLocal(worldRef.current);

    return worldRef.current.clone();
  }

  useEffect(() => {
    if (phase === "walkingDate") {
      handoffProgressRef.current = 0;
    }
  }, [phase]);

  useFrame((_, delta) => {
    if (!roseRef.current) {
      return;
    }

    const dateApproach = phase === "walkingDate";
    const dateStop = phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate" || phase === "leavingDate";
    const dinnerCarry = phase === "walkingDinner";
    const visible = dateApproach || dateStop || dinnerCarry;
    const start = getAnchor(
      dijonRef.current,
      new THREE.Vector3(0.32, 0.58, 0.06),
      dijonFallbackRef.current
    );
    const end = getAnchor(
      madisonRef.current,
      new THREE.Vector3(-0.28, 0.56, 0.04),
      madisonFallbackRef.current
    );
    const mid = midRef.current
      .copy(start)
      .lerp(end, 0.5)
      .add(new THREE.Vector3(0.02, 0.18, 0.08));
    const carry = carryRef.current.copy(end).add(new THREE.Vector3(0.05, -0.01, 0.02));
    const handoffTarget =
      phase === "walkingDate"
        ? 0
        : phase === "arrivedDate"
          ? 0.58
          : phase === "selectingDate"
            ? 0.9
            : phase === "lockedDate"
              ? 1
              : phase === "leavingDate" || dinnerCarry
                ? 1
                : 0;
    handoffProgressRef.current = THREE.MathUtils.damp(handoffProgressRef.current, handoffTarget, 1.35, delta);
    const handoffProgress = THREE.MathUtils.smootherstep(handoffProgressRef.current, 0, 1);
    const bezierPosition = startRef.current
      .copy(start)
      .multiplyScalar((1 - handoffProgress) * (1 - handoffProgress))
      .add(mid.clone().multiplyScalar(2 * (1 - handoffProgress) * handoffProgress))
      .add(end.clone().multiplyScalar(handoffProgress * handoffProgress));
    const targetPosition = dinnerCarry
      ? carry.clone().add(new THREE.Vector3(0, Math.sin(performance.now() * 0.0032) * 0.01, Math.sin(performance.now() * 0.0024) * 0.01))
      : bezierPosition;
    const targetRotation = dinnerCarry
      ? new THREE.Euler(0.12, -0.64, 1.72)
      : dateStop
        ? new THREE.Euler(0.1, -0.58, 1.62)
      : new THREE.Euler(-0.08, 0.42, 0.46);
    const targetScale = visible ? 0.92 : 0.001;

    roseRef.current.position.lerp(targetPosition, 1 - Math.exp(-2.9 * delta));
    const scaleLerp = 1 - Math.exp(-5 * delta);
    roseRef.current.scale.x = THREE.MathUtils.lerp(roseRef.current.scale.x, targetScale, scaleLerp);
    roseRef.current.scale.y = THREE.MathUtils.lerp(roseRef.current.scale.y, targetScale, scaleLerp);
    roseRef.current.scale.z = THREE.MathUtils.lerp(roseRef.current.scale.z, targetScale, scaleLerp);
    roseRef.current.rotation.x = THREE.MathUtils.damp(roseRef.current.rotation.x, targetRotation.x, 3.8, delta);
    roseRef.current.rotation.y = THREE.MathUtils.damp(roseRef.current.rotation.y, targetRotation.y, 3.8, delta);
    roseRef.current.rotation.z = THREE.MathUtils.damp(roseRef.current.rotation.z, targetRotation.z, 3.8, delta);
  });

  return (
    <group position={[-0.56, 1.06, 0.2]} ref={roseRef} scale={0.001}>
      <mesh position={[0, -0.1, 0]} rotation={[0.22, 0, 0.08]}>
        <capsuleGeometry args={[0.014, 0.34, 8, 12]} />
        <meshStandardMaterial color="#38563d" roughness={0.78} />
      </mesh>
      <mesh position={[0.03, -0.03, 0.02]} rotation={[0.4, 0.2, 0.8]} scale={[0.18, 0.07, 0.07]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#476c4d" roughness={0.7} />
      </mesh>
      <mesh position={[-0.02, 0.03, 0]}>
        <sphereGeometry args={[0.072, 18, 18]} />
        <meshStandardMaterial color="#b82642" emissive="#71152a" emissiveIntensity={0.28} roughness={0.46} />
      </mesh>
      <mesh position={[0.02, 0.065, 0.02]}>
        <sphereGeometry args={[0.06, 18, 18]} />
        <meshStandardMaterial color="#d5405b" emissive="#7b2035" emissiveIntensity={0.24} roughness={0.42} />
      </mesh>
      <mesh position={[0.05, 0.025, -0.02]}>
        <sphereGeometry args={[0.054, 18, 18]} />
        <meshStandardMaterial color="#c73451" emissive="#6f1a30" emissiveIntensity={0.22} roughness={0.44} />
      </mesh>
      <pointLight color="#d5405b" distance={3.8} intensity={0.76} position={[0.06, 0.18, 0.22]} />
    </group>
  );
}

function JoinedHands({ phase, walking }: { phase: JourneyPhase; walking: boolean }) {
  const handsRef = useRef<THREE.Group>(null);
  const active =
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

  useFrame(({ clock }, delta) => {
    if (!handsRef.current) {
      return;
    }

    const t = clock.getElapsedTime();
    const targetScale = active ? 1 : 0.001;
    const targetY = 1.12 + (walking ? Math.abs(Math.sin(t * STROLL_SWING_SPEED + 0.4)) * 0.028 : 0.004);
    const targetZ = 0.26 + (walking ? Math.sin(t * 0.82) * 0.018 : 0);

    handsRef.current.position.y = THREE.MathUtils.damp(handsRef.current.position.y, targetY, 4.6, delta);
    handsRef.current.position.z = THREE.MathUtils.damp(handsRef.current.position.z, targetZ, 4.6, delta);
    handsRef.current.scale.x = THREE.MathUtils.damp(handsRef.current.scale.x, targetScale, 5.4, delta);
    handsRef.current.scale.y = THREE.MathUtils.damp(handsRef.current.scale.y, targetScale, 5.4, delta);
    handsRef.current.scale.z = THREE.MathUtils.damp(handsRef.current.scale.z, targetScale, 5.4, delta);
    handsRef.current.rotation.z = THREE.MathUtils.damp(
      handsRef.current.rotation.z,
      walking ? Math.sin(t * STROLL_SWING_SPEED) * 0.05 : 0.02,
      4.4,
      delta
    );
  });

  return (
    <group position={[-0.02, 1.1, 0.26]} ref={handsRef} scale={0.001}>
      <mesh position={[-0.1, 0, 0]}>
        <sphereGeometry args={[0.062, 18, 18]} />
        <meshStandardMaterial color="#7c513d" roughness={0.54} />
      </mesh>
      <mesh position={[0.1, 0, 0]}>
        <sphereGeometry args={[0.056, 18, 18]} />
        <meshStandardMaterial color="#b37a57" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.005, 0.02]} rotation={[0.16, 0.18, 0.08]}>
        <capsuleGeometry args={[0.028, 0.15, 8, 12]} />
        <meshStandardMaterial color="#9d694d" roughness={0.48} />
      </mesh>
    </group>
  );
}

export function CharacterPair({ facingBoard, phase, walking }: { facingBoard: boolean; phase: JourneyPhase; walking: boolean }) {
  const dijonRef = useRef<THREE.Group | null>(null);
  const madisonRef = useRef<THREE.Group | null>(null);
  const roseMoment = phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate";
  const activityMoment =
    phase === "arrivedActivity" ||
    phase === "selectingActivity" ||
    phase === "lockedActivity";
  const skylineMoment =
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted";
  const holdingDrinks = phase === "lockedDrinks" || phase === "finalReveal" || phase === "submitted";
  const handHolding =
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

  return (
    <>
      <ModelAvatar
        activityMoment={activityMoment}
        avatarRef={dijonRef}
        drinkAccent="#d7a286"
        handHolding={handHolding}
        holdingDrink={holdingDrinks}
        modelPath="/models/dijon.glb"
        offset={[-0.5, 0, 0.08]}
        phase={phase}
        facingBoard={facingBoard}
        roseMoment={roseMoment}
        skylineMoment={skylineMoment}
        targetHeight={1.82}
        variant="dijon"
        walking={walking}
      />

      <Rose dijonRef={dijonRef} madisonRef={madisonRef} phase={phase} />
      <JoinedHands phase={phase} walking={walking} />

      <ModelAvatar
        activityMoment={activityMoment}
        avatarRef={madisonRef}
        drinkAccent="#f1bac2"
        handHolding={handHolding}
        holdingDrink={holdingDrinks}
        modelPath="/models/madison.glb"
        offset={[0.34, 0, -0.02]}
        phase={phase}
        facingBoard={facingBoard}
        roseMoment={roseMoment}
        skylineMoment={skylineMoment}
        targetHeight={1.74}
        variant="madison"
        walking={walking}
      />
    </>
  );
}

useGLTF.preload("/models/dijon.glb");
useGLTF.preload("/models/madison.glb");
