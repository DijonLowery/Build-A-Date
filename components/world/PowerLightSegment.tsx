"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { useSurfaceMaps } from "@/components/world/useSurfaceMaps";
import { useWorldAssets } from "@/components/world/useWorldAssets";

type PowerLightSegmentProps = {
  active: boolean;
  selectedActivityId: string | null;
};

type PowerLightSurfaceAssets = ReturnType<typeof useWorldAssets>;

function Performer({
  accent,
  active,
  kind,
  position
}: {
  accent: string;
  active: boolean;
  kind: "singer" | "bass" | "keys" | "drums";
  position: [number, number, number];
}) {
  const performerRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const phaseOffset = kind === "singer" ? 0 : kind === "bass" ? 0.8 : kind === "keys" ? 1.4 : 2.1;

  useFrame(({ clock }, delta) => {
    if (!performerRef.current) {
      return;
    }

    const t = clock.getElapsedTime() + phaseOffset;
    const sway = active ? Math.sin(t * 1.4) * 0.12 : Math.sin(t * 0.8) * 0.04;
    const bounce = active ? Math.abs(Math.sin(t * 1.18)) * 0.04 : 0.01;

    performerRef.current.rotation.y = THREE.MathUtils.damp(
      performerRef.current.rotation.y,
      kind === "keys" ? -0.18 : kind === "bass" ? 0.18 : 0,
      4,
      delta
    );
    performerRef.current.rotation.z = THREE.MathUtils.damp(performerRef.current.rotation.z, sway * 0.16, 4, delta);
    performerRef.current.position.y = THREE.MathUtils.damp(performerRef.current.position.y, position[1] + bounce, 4.5, delta);

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.damp(
        leftArmRef.current.rotation.x,
        kind === "drums" ? -0.62 + Math.sin(t * 3.2) * 0.34 : kind === "keys" ? -0.92 : -0.34 + sway * 0.8,
        5,
        delta
      );
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.damp(
        rightArmRef.current.rotation.x,
        kind === "drums" ? -0.5 - Math.sin(t * 3.2) * 0.34 : kind === "keys" ? -0.84 : -0.18 - sway * 0.8,
        5,
        delta
      );
    }
  });

  return (
    <group position={position} ref={performerRef}>
      <mesh castShadow position={[0, 1.54, 0]}>
        <sphereGeometry args={[0.23, 20, 20]} />
        <meshStandardMaterial color="#7b553d" roughness={0.66} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]} scale={[0.66, 0.92, 0.42]}>
        <capsuleGeometry args={[0.22, 0.54, 10, 18]} />
        <meshStandardMaterial color="#141820" roughness={0.68} />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]} scale={[0.56, 0.8, 0.34]}>
        <capsuleGeometry args={[0.18, 0.42, 10, 18]} />
        <meshStandardMaterial color="#171b22" roughness={0.7} />
      </mesh>

      <group position={[-0.24, 1.04, 0]} ref={leftArmRef}>
        <mesh castShadow position={[0, -0.3, 0]} rotation={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.06, 0.56, 8, 14]} />
          <meshStandardMaterial color="#181b22" roughness={0.72} />
        </mesh>
      </group>
      <group position={[0.24, 1.04, 0]} ref={rightArmRef}>
        <mesh castShadow position={[0, -0.3, 0]} rotation={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.06, 0.56, 8, 14]} />
          <meshStandardMaterial color="#181b22" roughness={0.72} />
        </mesh>
      </group>

      <mesh castShadow position={[-0.1, -0.34, 0]} rotation={[0.1, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.74, 8, 14]} />
        <meshStandardMaterial color="#16191f" roughness={0.78} />
      </mesh>
      <mesh castShadow position={[0.1, -0.34, 0]} rotation={[-0.1, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.74, 8, 14]} />
        <meshStandardMaterial color="#16191f" roughness={0.78} />
      </mesh>

      {kind === "singer" ? (
        <>
          <mesh position={[0.22, 0.8, 0.38]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.1, 12]} />
            <meshStandardMaterial color="#c3b7ab" metalness={0.36} roughness={0.32} />
          </mesh>
          <mesh position={[0.22, 1.34, 0.42]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18} roughness={0.3} />
          </mesh>
        </>
      ) : null}

      {kind === "bass" ? (
        <group position={[0.22, 0.74, 0.24]} rotation={[0.2, 0, -0.36]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.13, 0.44, 10, 18]} />
            <meshStandardMaterial color="#8d5f42" roughness={0.42} />
          </mesh>
          <mesh castShadow position={[0.1, 0.64, 0]}>
            <boxGeometry args={[0.08, 1.14, 0.06]} />
            <meshStandardMaterial color="#7c563f" roughness={0.46} />
          </mesh>
        </group>
      ) : null}

      {kind === "keys" ? (
        <group position={[0.02, 0.7, 0.34]}>
          <mesh castShadow position={[0, 0.16, 0]}>
            <boxGeometry args={[0.92, 0.12, 0.28]} />
            <meshStandardMaterial color="#22242c" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.18, 0.16]}>
            <planeGeometry args={[0.84, 0.06]} />
            <meshBasicMaterial color="#f0eee8" opacity={0.84} transparent />
          </mesh>
          <mesh castShadow position={[-0.24, -0.14, 0]} rotation={[0.18, 0, 0.14]}>
            <capsuleGeometry args={[0.02, 0.64, 6, 10]} />
            <meshStandardMaterial color="#474952" roughness={0.56} />
          </mesh>
          <mesh castShadow position={[0.24, -0.14, 0]} rotation={[0.18, 0, -0.14]}>
            <capsuleGeometry args={[0.02, 0.64, 6, 10]} />
            <meshStandardMaterial color="#474952" roughness={0.56} />
          </mesh>
        </group>
      ) : null}

      {kind === "drums" ? (
        <group position={[0, 0.52, 0.48]}>
          <mesh castShadow position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.36, 0.42, 0.4, 24]} />
            <meshStandardMaterial color="#6b4a42" roughness={0.42} />
          </mesh>
          <mesh castShadow position={[-0.42, 0.26, -0.18]}>
            <cylinderGeometry args={[0.14, 0.18, 0.12, 18]} />
            <meshStandardMaterial color="#7a5850" roughness={0.46} />
          </mesh>
          <mesh castShadow position={[0.42, 0.22, -0.12]}>
            <cylinderGeometry args={[0.14, 0.18, 0.12, 18]} />
            <meshStandardMaterial color="#7a5850" roughness={0.46} />
          </mesh>
          {[-0.48, 0.48].map((x) => (
            <group key={x} position={[x, 0.62, -0.16]}>
              <mesh castShadow position={[0, -0.18, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.42, 8]} />
                <meshStandardMaterial color="#b8a793" metalness={0.32} roughness={0.34} />
              </mesh>
              <mesh castShadow>
                <cylinderGeometry args={[0.18, 0.18, 0.02, 20]} />
                <meshStandardMaterial color="#e5d7b9" metalness={0.18} roughness={0.28} />
              </mesh>
            </group>
          ))}
        </group>
      ) : null}
    </group>
  );
}

function CocktailTable({
  position,
  woodNormalMap,
  woodRoughnessMap
}: {
  position: [number, number, number];
  woodNormalMap: THREE.Texture;
  woodRoughnessMap: THREE.Texture;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.54, 0.58, 0.08, 22]} />
        <meshPhysicalMaterial clearcoat={0.4} clearcoatRoughness={0.28} color="#b68f73" envMapIntensity={1.28} normalMap={woodNormalMap} normalScale={new THREE.Vector2(0.24, 0.24)} roughness={0.46} roughnessMap={woodRoughnessMap} />
      </mesh>
      <mesh castShadow position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.76, 16]} />
        <meshStandardMaterial color="#594740" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, -0.83, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.06, 18]} />
        <meshStandardMaterial color="#594740" roughness={0.74} />
      </mesh>
      <mesh position={[0.12, 0.14, 0.06]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#fff0df" emissive="#ffc188" emissiveIntensity={0.66} />
      </mesh>
    </group>
  );
}

function VenueGuest({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#6c4c38" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 0.58, 0]} scale={[0.7, 1, 0.42]}>
        <capsuleGeometry args={[0.18, 0.5, 10, 16]} />
        <meshStandardMaterial color="#161a20" roughness={0.74} />
      </mesh>
    </group>
  );
}

function LiveSoulRoom({
  active,
  surfaces
}: {
  active: boolean;
  surfaces: PowerLightSurfaceAssets;
}) {
  return (
    <group position={[-1.1, 0, -108.8]}>
      <mesh castShadow position={[0, 0.28, 0]} rotation={[0, 0, 0]}>
        <RoundedBox args={[9.2, 0.36, 4.8]} radius={0.2} smoothness={6}>
          <meshPhysicalMaterial clearcoat={0.18} clearcoatRoughness={0.42} color="#3b3437" envMapIntensity={1.12} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.14, 0.14)} roughness={0.68} roughnessMap={surfaces.concreteWallRoughness} />
        </RoundedBox>
      </mesh>
      <RoundedBox args={[9.9, 6.2, 0.42]} position={[0, 3.16, -0.44]} radius={0.18} smoothness={8}>
        <meshStandardMaterial color="#7a6371" envMapIntensity={0.54} map={surfaces.brickFacadeColor} normalMap={surfaces.brickFacadeNormal} normalScale={new THREE.Vector2(0.18, 0.18)} roughness={0.92} roughnessMap={surfaces.brickFacadeRoughness} />
      </RoundedBox>
      <RoundedBox args={[1.2, 5.8, 0.24]} position={[-4.48, 3.02, 0.26]} radius={0.14} smoothness={6}>
        <meshStandardMaterial color="#745060" envMapIntensity={0.44} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.12, 0.12)} roughness={0.84} roughnessMap={surfaces.concreteWallRoughness} />
      </RoundedBox>
      <RoundedBox args={[1.2, 5.8, 0.24]} position={[4.48, 3.02, 0.26]} radius={0.14} smoothness={6}>
        <meshStandardMaterial color="#745060" envMapIntensity={0.44} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.12, 0.12)} roughness={0.84} roughnessMap={surfaces.concreteWallRoughness} />
      </RoundedBox>

      <mesh position={[0, 3.86, 0.02]}>
        <planeGeometry args={[7.6, 2.6]} />
        <meshBasicMaterial color="#2f4160" opacity={active ? 0.22 : 0.08} transparent />
      </mesh>
      <mesh position={[0, 1.84, 0.06]}>
        <planeGeometry args={[6.8, 1.8]} />
        <meshBasicMaterial color="#f1b177" opacity={active ? 0.12 : 0.04} transparent />
      </mesh>

      <Text color="#fff1df" fontSize={0.34} letterSpacing={0.06} position={[0, 4.62, 0.08]} textAlign="center">
        soul in the room
      </Text>
      <Text color="#c5dfff" fontSize={0.14} letterSpacing={0.12} position={[0, 4.12, 0.08]} textAlign="center">
        live band at the back
      </Text>

      <Performer accent="#f0bf8d" active={active} kind="bass" position={[-2.14, 0.48, 0.92]} />
      <Performer accent="#d0b6e1" active={active} kind="drums" position={[0, 0.44, -0.08]} />
      <Performer accent="#f8cea2" active={active} kind="singer" position={[0.42, 0.44, 1.36]} />
      <Performer accent="#9ac2ff" active={active} kind="keys" position={[2.24, 0.42, 0.92]} />

      <pointLight color="#f0b47b" distance={20} intensity={active ? 2.1 : 0.92} position={[-1.8, 4.1, 2.2]} />
      <pointLight color="#8cb5ff" distance={18} intensity={active ? 1.62 : 0.56} position={[2.24, 3.86, 2.18]} />
      <pointLight color="#ffd6b1" distance={12} intensity={active ? 0.72 : 0.26} position={[0.14, 2.82, 1.44]} />
      <rectAreaLight color="#ffbb7a" height={2.2} intensity={active ? 2.6 : 1.1} position={[-1.6, 3.4, 1.8]} rotation={[-0.24, 0.34, 0]} width={1.2} />
      <rectAreaLight color="#89b2ff" height={2} intensity={active ? 2.2 : 0.92} position={[2.1, 3.3, 1.74]} rotation={[-0.22, -0.34, 0]} width={1.08} />

      <Sparkles color="#ffd8b4" count={10} opacity={active ? 0.14 : 0.04} position={[0, 2.8, 1.6]} scale={[5.8, 2.4, 2.8]} size={2.2} speed={0.08} />
    </group>
  );
}

export function PowerLightSegment({ active, reducedDetail = false, selectedActivityId }: PowerLightSegmentProps & { reducedDetail?: boolean }) {
  const { metalnessMap, woodNormalMap, woodRoughnessMap } = useSurfaceMaps();
  const surfaces = useWorldAssets();
  const musicSelected = selectedActivityId === "music-vibes";

  return (
    <>
      <group position={[-1.2, -0.01, -101.2]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[24, 32]} />
          {reducedDetail ? (
            <meshPhysicalMaterial clearcoat={0.22} clearcoatRoughness={0.34} color="#252227" envMapIntensity={0.94} map={surfaces.asphaltFloorColor} metalness={0.18} metalnessMap={metalnessMap} normalMap={surfaces.asphaltFloorNormal} normalScale={new THREE.Vector2(-0.12, -0.12)} roughness={0.42} roughnessMap={surfaces.asphaltFloorRoughness} />
          ) : (
            <MeshReflectorMaterial
              blur={[180, 56]}
              color="#161820"
              depthScale={0.3}
              envMapIntensity={1.48}
              map={surfaces.asphaltFloorColor}
              metalnessMap={metalnessMap}
              metalness={0.38}
              mirror={0.26}
              mixBlur={1}
              mixStrength={10}
              normalMap={surfaces.asphaltFloorNormal}
              normalScale={new THREE.Vector2(-0.18, -0.18)}
              resolution={512}
              roughnessMap={surfaces.asphaltFloorRoughness}
              roughness={0.26}
            />
          )}
        </mesh>

        {[-10.2, 10.2].map((x) => (
          <mesh key={x} position={[x, 0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.8, 32]} />
            <meshStandardMaterial color="#cac4c3" envMapIntensity={0.88} map={surfaces.concreteSidewalkColor} normalMap={surfaces.concreteSidewalkNormal} normalScale={new THREE.Vector2(0.16, 0.16)} roughness={0.92} roughnessMap={surfaces.concreteSidewalkRoughness} />
          </mesh>
        ))}
      </group>

      <mesh position={[-1.2, 4.9, -113.1]}>
        <planeGeometry args={[24.8, 10.8]} />
        <meshStandardMaterial color="#7a6a6c" envMapIntensity={0.56} map={surfaces.brickFacadeColor} normalMap={surfaces.brickFacadeNormal} normalScale={new THREE.Vector2(0.16, 0.16)} roughness={0.9} roughnessMap={surfaces.brickFacadeRoughness} />
      </mesh>
      <mesh position={[-11.4, 4.8, -101.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[21.2, 9.8]} />
        <meshStandardMaterial color="#bfb8b8" envMapIntensity={0.48} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.14, 0.14)} roughness={0.88} roughnessMap={surfaces.concreteWallRoughness} />
      </mesh>
      <mesh position={[9.2, 4.8, -101.4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[21.2, 9.8]} />
        <meshStandardMaterial color="#bfb8b8" envMapIntensity={0.48} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.14, 0.14)} roughness={0.88} roughnessMap={surfaces.concreteWallRoughness} />
      </mesh>
      <mesh position={[-1.2, 8.4, -101.8]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24.8, 21.2]} />
        <meshStandardMaterial color="#6a6376" envMapIntensity={0.38} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.1, 0.1)} roughness={0.9} roughnessMap={surfaces.concreteWallRoughness} />
      </mesh>

      {[-7.2, 7.2].map((x) => (
        <group key={`booth-${x}`} position={[x, 0, -97.2]}>
          <RoundedBox args={[2.4, 1.42, 0.8]} position={[0, 0.76, 0]} radius={0.12} smoothness={6}>
            <meshStandardMaterial color="#2b242e" roughness={0.84} />
          </RoundedBox>
          <RoundedBox args={[2.48, 0.44, 2.8]} position={[0, 0.22, 1.32]} radius={0.12} smoothness={6}>
            <meshStandardMaterial color="#201b22" roughness={0.84} />
          </RoundedBox>
          <CocktailTable position={[0, 0.92, 0.2]} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />
          <VenueGuest position={[-0.46, 0, 0.9]} scale={0.94} />
          <VenueGuest position={[0.56, 0, 1.08]} scale={0.86} />
        </group>
      ))}

      {[-1.6, 2.2].map((x, index) => (
        <CocktailTable key={`table-${x}`} position={[x, 1.14, -96.6 - index * 1.8]} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />
      ))}
      <VenueGuest position={[-2.24, 0, -96.8]} scale={0.94} />
      <VenueGuest position={[2.64, 0, -98]} scale={0.88} />

      <mesh position={[-1.2, 5.68, -108.4]}>
        <planeGeometry args={[7.6, 1.8]} />
        <meshBasicMaterial color={musicSelected ? "#89b7ff" : "#6a8fb9"} opacity={active ? 0.12 : 0.03} transparent />
      </mesh>
      <mesh position={[-1.2, 4.04, -95.8]}>
        <planeGeometry args={[6.8, 1.12]} />
        <meshBasicMaterial color="#ffc799" opacity={active ? 0.14 : 0.04} transparent />
      </mesh>

      <LiveSoulRoom active={active} surfaces={surfaces} />
      <Sparkles color="#b6d1ff" count={reducedDetail ? 8 : 16} opacity={active ? 0.06 : 0.02} position={[-1.2, 5.2, -101.6]} scale={[16, 4.8, 18]} size={1.9} speed={0.08} />
    </>
  );
}
