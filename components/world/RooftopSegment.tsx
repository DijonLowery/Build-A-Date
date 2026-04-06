"use client";

import { MeshReflectorMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { JourneyPhase } from "@/components/world/RouteController";
import { useSurfaceMaps } from "@/components/world/useSurfaceMaps";
import { useWorldAssets } from "@/components/world/useWorldAssets";

type RooftopSegmentProps = {
  active: boolean;
  phase: JourneyPhase;
  selectedDrinksId: string | null;
};

type RooftopSurfaceAssets = ReturnType<typeof useWorldAssets>;

const drinksStops = [
  {
    accent: "#cc8a63",
    id: "xo-hifi",
    position: [2.9, 5.18, -126.9],
    tone: "#372727"
  },
  {
    accent: "#a38e78",
    id: "hidden-favorite",
    position: [9.4, 5.18, -127.8],
    tone: "#373233"
  },
  {
    accent: "#d6af82",
    id: "city-views",
    position: [11.2, 5.12, -123.6],
    tone: "#3b302c"
  },
  {
    accent: "#9e6881",
    id: "one-more-stop",
    position: [7.2, 5.16, -123.1],
    tone: "#382a32"
  }
] as const;

function RooftopFacade({
  accent,
  emphasized,
  position,
  tone
}: {
  accent: string;
  emphasized: boolean;
  position: [number, number, number];
  tone: string;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[1.2, 0.74, 0.22]} castShadow radius={0.1} smoothness={6}>
        <meshStandardMaterial color={tone} roughness={0.76} />
      </RoundedBox>
      <mesh position={[0, 0.04, 0.14]}>
        <planeGeometry args={[0.96, 0.16]} />
        <meshBasicMaterial color="#fff1e3" opacity={emphasized ? 0.92 : 0.78} transparent />
      </mesh>
      <mesh position={[0, 0.24, 0.12]}>
        <planeGeometry args={[1.12, 0.1]} />
        <meshBasicMaterial color={accent} opacity={emphasized ? 0.54 : 0.24} transparent />
      </mesh>
      {emphasized ? <pointLight color="#ffd1a6" distance={5.4} intensity={0.78} position={[0, 0.86, 0.72]} /> : null}
    </group>
  );
}

function SkylineTower({
  accent = "#ffdfbb",
  glow = "#61789b",
  position,
  size,
  tone
}: {
  accent?: string;
  glow?: string;
  position: [number, number, number];
  size: [number, number, number];
  tone: string;
}) {
  const rows = Math.max(4, Math.round(size[1] * 0.82));

  return (
    <group position={position}>
      <RoundedBox args={size} castShadow radius={0.16} smoothness={8}>
        <meshStandardMaterial color={tone} roughness={0.88} />
      </RoundedBox>

      <mesh position={[0, size[1] * 0.42, size[2] * 0.52]}>
        <planeGeometry args={[size[0] * 0.84, size[1] * 0.22]} />
        <meshBasicMaterial color={glow} opacity={0.16} transparent />
      </mesh>

      {Array.from({ length: rows }).map((_, row) => (
        <mesh
          key={row}
          position={[
            0,
            size[1] * 0.34 - row * (size[1] * 0.14),
            size[2] * 0.52
          ]}
        >
          <planeGeometry args={[size[0] * (0.5 + (row % 3) * 0.12), 0.08]} />
          <meshBasicMaterial color={accent} opacity={0.08 + (row % 4) * 0.04} transparent />
        </mesh>
      ))}
    </group>
  );
}

function KansasCitySkyline({ active, surfaces }: { active: boolean; surfaces: RooftopSurfaceAssets }) {
  const towers = [
    { position: [-7.4, 8.4, -149.8] as [number, number, number], size: [2.4, 11.8, 1.2] as [number, number, number], tone: "#28313e" },
    { position: [-4.2, 7.4, -151.4] as [number, number, number], size: [2.1, 10.2, 1.04] as [number, number, number], tone: "#242c39" },
    { position: [-0.2, 8.9, -152.4] as [number, number, number], size: [1.84, 12.6, 0.96] as [number, number, number], tone: "#2a3340" },
    { position: [2.7, 9.8, -151.2] as [number, number, number], size: [2.68, 14.2, 1.18] as [number, number, number], tone: "#29313f" },
    { position: [6.2, 8.2, -150] as [number, number, number], size: [2.28, 11.6, 1.02] as [number, number, number], tone: "#26303d" },
    { position: [9.2, 6.9, -148.8] as [number, number, number], size: [1.8, 9.2, 0.92] as [number, number, number], tone: "#23303d" }
  ];

  return (
    <group>
      <mesh position={[6.3, 8.2, -160.8]}>
        <planeGeometry args={[30, 4.2]} />
        <meshBasicMaterial color="#f8d1ae" opacity={active ? 0.14 : 0.08} transparent />
      </mesh>

      <group position={[5.8, 0, 0]}>
        {[-11.6, -8.4, -5.4, -2.2, 1.2, 4.3, 7.6, 10.2].map((x, index) => (
          <RoundedBox
            args={[2.4 + (index % 3) * 0.8, 4 + (index % 2) * 1.2, 1]}
            castShadow
            key={`mid-${x}`}
            position={[x, 4.2 + (index % 2) * 0.6, -145.2 - (index % 3)]}
            radius={0.14}
            smoothness={6}
          >
            <meshStandardMaterial color={index % 2 === 0 ? "#59637a" : "#505b72"} envMapIntensity={0.42} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.14, 0.14)} roughness={0.9} roughnessMap={surfaces.concreteWallRoughness} />
          </RoundedBox>
        ))}
      </group>

      {towers.map((tower) => (
        <SkylineTower key={`${tower.position[0]}-${tower.position[2]}`} position={tower.position} size={tower.size} tone={tower.tone} />
      ))}

      <mesh position={[-2.6, 4.62, -146.3]}>
        <RoundedBox args={[7.4, 3.2, 0.8]} radius={0.2} smoothness={6}>
          <meshStandardMaterial color="#616879" envMapIntensity={0.4} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.1, 0.1)} roughness={0.86} roughnessMap={surfaces.concreteWallRoughness} />
        </RoundedBox>
      </mesh>
      <mesh position={[-2.6, 4.9, -145.84]}>
        <planeGeometry args={[6.8, 1.24]} />
        <meshBasicMaterial color="#ffd9b1" opacity={0.12} transparent />
      </mesh>

      {[-2.6, 2.2, 6.8].map((x) => (
        <mesh key={`antenna-${x}`} position={[x, 14.6, -150.1]}>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
          <meshStandardMaterial color="#7b828d" metalness={0.26} roughness={0.44} />
        </mesh>
      ))}

      <mesh position={[6.3, 10.4, -155.8]}>
        <planeGeometry args={[30, 8.8]} />
        <meshBasicMaterial color="#3a4a66" opacity={0.12} transparent />
      </mesh>
    </group>
  );
}

function RooftopTable({
  active,
  woodNormalMap,
  woodRoughnessMap
}: {
  active: boolean;
  woodNormalMap: THREE.Texture;
  woodRoughnessMap: THREE.Texture;
}) {
  return (
    <group position={[9.32, 5.16, -127.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.84, 0.88, 0.08, 24]} />
        <meshPhysicalMaterial clearcoat={0.42} clearcoatRoughness={0.24} color="#b99377" envMapIntensity={1.34} normalMap={woodNormalMap} normalScale={new THREE.Vector2(0.22, 0.22)} roughness={0.42} roughnessMap={woodRoughnessMap} />
      </mesh>
      <mesh castShadow position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.72, 18]} />
        <meshStandardMaterial color="#5a463e" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.12, 18, 18]} />
        <meshStandardMaterial color="#fff1df" emissive="#ffc790" emissiveIntensity={active ? 1.08 : 0.46} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <group key={x} position={[x, 0.06, 0.24]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.042, 0.16, 18]} />
            <meshStandardMaterial color="#fff7f2" opacity={0.24} roughness={0.08} transparent />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.04, 0.036, 0.08, 18]} />
            <meshStandardMaterial color={x < 0 ? "#e4b4c3" : "#d8a68f"} emissive={x < 0 ? "#e4b4c3" : "#d8a68f"} emissiveIntensity={0.14} roughness={0.22} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function RooftopSegment({ active, phase, reducedDetail = false, selectedDrinksId }: RooftopSegmentProps & { reducedDetail?: boolean }) {
  const { metalnessMap, woodNormalMap, woodRoughnessMap } = useSurfaceMaps();
  const surfaces = useWorldAssets();
  const showApproach = phase === "walkingDrinks";

  return (
    <>
      {showApproach ? (
        <group position={[2.3, 1.1, -121.8]} rotation={[-0.36, 0.16, 0]}>
          <mesh receiveShadow>
            <planeGeometry args={[5, 16]} />
            <meshStandardMaterial color="#b3aaa5" map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.12, 0.12)} roughness={0.86} roughnessMap={surfaces.concreteWallRoughness} />
          </mesh>
        </group>
      ) : null}

      <group position={[6.22, 4.86, -129.2]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18.6, 14.2]} />
          {reducedDetail ? (
            <meshPhysicalMaterial clearcoat={0.24} clearcoatRoughness={0.34} color="#271f20" envMapIntensity={0.96} map={surfaces.asphaltFloorColor} metalness={0.16} metalnessMap={metalnessMap} normalMap={surfaces.asphaltFloorNormal} normalScale={new THREE.Vector2(-0.12, -0.12)} roughness={0.42} roughnessMap={surfaces.asphaltFloorRoughness} />
          ) : (
            <MeshReflectorMaterial
              blur={[180, 60]}
              color="#201819"
              depthScale={0.36}
              envMapIntensity={1.56}
              map={surfaces.asphaltFloorColor}
              metalnessMap={metalnessMap}
              metalness={0.36}
              mirror={0.24}
              mixBlur={1}
              mixStrength={10}
              normalMap={surfaces.asphaltFloorNormal}
              normalScale={new THREE.Vector2(-0.18, -0.18)}
              resolution={512}
              roughnessMap={surfaces.asphaltFloorRoughness}
              roughness={0.24}
            />
          )}
        </mesh>
      </group>

      <group position={[6.22, 5.26, -136.1]}>
        {[-6.9, 6.9].map((x) => (
          <mesh castShadow key={x} position={[x, 0.96, 0]} rotation={[0, Math.PI / 2, 0]}>
            <capsuleGeometry args={[0.08, 2.6, 10, 18]} />
            <meshStandardMaterial color="#b5b0ae" envMapIntensity={1.04} map={surfaces.concreteWallColor} metalness={0.2} metalnessMap={metalnessMap} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.08, 0.08)} roughness={0.58} roughnessMap={surfaces.concreteWallRoughness} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 1.36, 0]} rotation={[0, Math.PI / 2, 0]}>
          <capsuleGeometry args={[0.06, 14.4, 10, 18]} />
          <meshStandardMaterial color="#b8b1af" envMapIntensity={1.08} map={surfaces.concreteWallColor} metalness={0.18} metalnessMap={metalnessMap} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.08, 0.08)} roughness={0.54} roughnessMap={surfaces.concreteWallRoughness} />
        </mesh>
      </group>

      <group position={[6.22, 5.1, -129.2]}>
        {[-7.8, 7.8].map((x) => (
          <mesh castShadow key={x} position={[x, 1.2, 0]}>
            <capsuleGeometry args={[0.08, 13.8, 10, 18]} />
            <meshStandardMaterial color="#b4adaa" envMapIntensity={0.96} map={surfaces.concreteWallColor} metalness={0.18} metalnessMap={metalnessMap} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.08, 0.08)} roughness={0.62} roughnessMap={surfaces.concreteWallRoughness} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 0.12, -6.98]}>
          <boxGeometry args={[16.2, 0.24, 0.52]} />
          <meshStandardMaterial color="#c7beb7" envMapIntensity={0.82} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.12, 0.12)} roughness={0.74} roughnessMap={surfaces.concreteWallRoughness} />
        </mesh>
      </group>

      <KansasCitySkyline active={active} surfaces={surfaces} />
      <RooftopTable active={active} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />

      {drinksStops.map((stop) => (
        <RooftopFacade
          accent={stop.accent}
          emphasized={selectedDrinksId === stop.id}
          key={stop.id}
          position={stop.position as [number, number, number]}
          tone={stop.tone}
        />
      ))}

      <Sparkles color="#ffd6ad" count={reducedDetail ? 8 : 18} opacity={active ? 0.12 : 0.04} position={[6.3, 8, -134.4]} scale={[18, 6, 12]} size={2.6} speed={0.08} />
      <Sparkles color="#fff7ee" count={reducedDetail ? 12 : 32} opacity={0.22} position={[6.2, 13.4, -147.2]} scale={[30, 6.8, 4]} size={0.86} speed={0.02} />
    </>
  );
}
