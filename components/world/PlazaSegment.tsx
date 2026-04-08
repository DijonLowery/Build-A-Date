"use client";

import { MeshReflectorMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { BillboardTree } from "@/components/world/BillboardTree";
import { ScenicPlate } from "@/components/world/ScenicPlate";
import { SafeSceneText } from "@/components/world/SafeSceneText";
import { useSurfaceMaps } from "@/components/world/useSurfaceMaps";
import { useWorldAssets } from "@/components/world/useWorldAssets";

type PlazaSegmentProps = {
  active: boolean;
  selectedDinnerId: string | null;
};

type PlazaSurfaceAssets = ReturnType<typeof useWorldAssets>;

const dinnerBuildings = [
  {
    accent: "#7b4b38",
    cue: "Steakhouse",
    id: "steakhouse",
    label: "An Upscale Steakhouse",
    position: [-13.4, 0, -62.4],
    scale: [1.06, 1.12, 1] as [number, number, number],
    tone: "#5f4136"
  },
  {
    accent: "#8d6452",
    cue: "Cooper's",
    id: "coopers-hawk",
    label: "Cooper's Hawk",
    position: [-12.9, 0, -74.2],
    scale: [0.92, 0.98, 1] as [number, number, number],
    tone: "#6a4b3f"
  },
  {
    accent: "#a16852",
    cue: "New Spot",
    id: "something-new",
    label: "Something New",
    position: [13.2, 0, -62.2],
    scale: [1.04, 1.08, 1] as [number, number, number],
    tone: "#69483d"
  },
  {
    accent: "#92506b",
    cue: "At Home",
    id: "chef-boyardijon",
    label: "Chef BoyarDijon",
    position: [12.6, 0, -73.8],
    scale: [1.08, 1.04, 1] as [number, number, number],
    tone: "#5e423d"
  }
] as const;

const backdropBuildings = [
  {
    accent: "#8d654e",
    cue: "Courtyard",
    label: "Evening rooms",
    position: [-3.8, 0, -76.6],
    scale: [1.06, 1.02, 1] as [number, number, number],
    tone: "#65453a"
  },
  {
    accent: "#9f735b",
    cue: "Plaza",
    label: "Lantern hall",
    position: [1.6, 0, -77.2],
    scale: [1.26, 1.18, 1] as [number, number, number],
    tone: "#6b4a3f"
  },
  {
    accent: "#8a604f",
    cue: "Patio",
    label: "Courtyard lights",
    position: [6.9, 0, -76.4],
    scale: [1.04, 1, 1] as [number, number, number],
    tone: "#62443b"
  }
] as const;

function PlazaLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3.6, 18]} />
        <meshStandardMaterial color="#2c2728" metalness={0.28} roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 3.56, 0]} scale={[0.68, 0.76, 0.68]}>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshStandardMaterial color="#ffdeb9" emissive="#f2a65c" emissiveIntensity={2.1} toneMapped={false} />
      </mesh>
      <pointLight color="#ffbf79" distance={10} intensity={1.7} position={[0, 3.48, 0.08]} />
    </group>
  );
}

function WarmFacade({
  accent,
  cue,
  emphasized,
  label,
  position,
  scale,
  surfaces,
  tone
}: {
  accent: string;
  cue: string;
  emphasized: boolean;
  label: string;
  position: [number, number, number];
  scale: [number, number, number];
  surfaces: PlazaSurfaceAssets;
  tone: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 2.86, 0]} scale={[1.72, 1.34, 0.9]}>
        <capsuleGeometry args={[1.18, 3.16, 12, 22]} />
        <meshStandardMaterial color={tone} envMapIntensity={0.64} map={surfaces.brickFacadeColor} normalMap={surfaces.brickFacadeNormal} normalScale={new THREE.Vector2(0.2, 0.2)} roughness={0.88} roughnessMap={surfaces.brickFacadeRoughness} />
      </mesh>

      <mesh castShadow position={[0, 0.98, 1]} scale={[1.88, 0.76, 0.28]}>
        <capsuleGeometry args={[1.12, 1.64, 12, 20]} />
        <meshStandardMaterial color="#d9d0c8" envMapIntensity={0.46} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.14, 0.14)} roughness={0.84} roughnessMap={surfaces.concreteWallRoughness} />
      </mesh>

      <mesh castShadow position={[0, 1.4, 1.08]} rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1, 1]}>
        <cylinderGeometry args={[1.14, 1.28, 0.26, 24, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color={accent} roughness={0.56} />
      </mesh>

      {[-0.98, 0.02, 1.02].map((x, index) => (
        <mesh key={index} position={[x, 0.72, 1.12]} scale={[0.8, 1.08, 1]}>
          <planeGeometry args={[0.72, 1.02]} />
          <meshBasicMaterial color="#ffd7ab" opacity={0.26} transparent />
        </mesh>
      ))}

      {[-1.02, -0.06, 0.92].map((x, index) => (
        <mesh key={`upper-${index}`} position={[x, 3.1, 1.08]} scale={[0.8, 1.18, 1]}>
          <planeGeometry args={[0.66, 1.08]} />
          <meshBasicMaterial color="#ffd1a0" opacity={0.16} transparent />
        </mesh>
      ))}

      <mesh position={[0, 1.9, 1.18]}>
        <planeGeometry args={[2.18, 0.34]} />
        <meshBasicMaterial color="#fff2df" opacity={emphasized ? 0.96 : 0.82} transparent />
      </mesh>
      <SafeSceneText color="#fff6ec" fontSize={0.18} maxWidth={2.5} position={[0, 1.9, 1.2]} textAlign="center">
        {label}
      </SafeSceneText>
      <SafeSceneText color={emphasized ? "#ffdcb0" : "#f5dcc0"} fontSize={0.14} maxWidth={2.2} position={[0, 2.34, 1.2]} textAlign="center">
        {cue}
      </SafeSceneText>

      {emphasized ? <pointLight color="#ffbf78" distance={8.5} intensity={1.18} position={[0, 2.26, 1.5]} /> : null}
    </group>
  );
}

function Fountain({ active }: { active: boolean }) {
  return (
    <group position={[2, 0, -62.4]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[1.38, 1.52, 0.36, 32]} />
        <meshStandardMaterial color="#6f7176" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[1.1, 1.18, 0.12, 32]} />
        <meshStandardMaterial color="#1f2835" roughness={0.34} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.76, 24]} />
        <meshStandardMaterial color="#7b7f83" roughness={0.74} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial color="#fff0d6" emissive="#ffc885" emissiveIntensity={active ? 1.2 : 0.62} toneMapped={false} />
      </mesh>
      <pointLight color="#ffc379" distance={7.4} intensity={active ? 1.26 : 0.8} position={[0, 1.2, 0.1]} />
    </group>
  );
}

function TerraceSet({
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
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.82, 18]} />
        <meshStandardMaterial color="#57433a" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.58, 0.62, 0.08, 22]} />
        <meshPhysicalMaterial clearcoat={0.32} clearcoatRoughness={0.36} color="#b99377" envMapIntensity={1.2} normalMap={woodNormalMap} normalScale={new THREE.Vector2(0.2, 0.2)} roughness={0.48} roughnessMap={woodRoughnessMap} />
      </mesh>
      <mesh castShadow position={[0, 1.48, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.86, 0.8, 24]} />
        <meshStandardMaterial color="#ead8cf" roughness={0.64} />
      </mesh>
    </group>
  );
}

function DiningSet({
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
      <mesh castShadow position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.62, 0.66, 0.08, 24]} />
        <meshPhysicalMaterial clearcoat={0.42} clearcoatRoughness={0.24} color="#c59b7b" envMapIntensity={1.24} normalMap={woodNormalMap} normalScale={new THREE.Vector2(0.22, 0.22)} roughness={0.42} roughnessMap={woodRoughnessMap} />
      </mesh>
      <mesh castShadow position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.72, 18]} />
        <meshStandardMaterial color="#5c443b" roughness={0.72} />
      </mesh>
      {[
        [-0.88, 0, 0.08],
        [0.88, 0, 0.08]
      ].map((offset, index) => (
        <group key={index} position={offset as [number, number, number]}>
          <RoundedBox args={[0.4, 0.1, 0.4]} position={[0, 0.5, 0]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color="#eadccf" roughness={0.64} />
          </RoundedBox>
          <RoundedBox args={[0.14, 0.84, 0.14]} position={[0, 0.08, 0.12]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color="#5f463e" roughness={0.76} />
          </RoundedBox>
          <RoundedBox args={[0.46, 0.74, 0.08]} position={[0, 0.9, -0.12]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color="#5f463e" roughness={0.76} />
          </RoundedBox>
        </group>
      ))}
      <mesh position={[0.12, 0.84, 0.08]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial color="#fff0da" emissive="#ffca90" emissiveIntensity={0.84} />
      </mesh>
    </group>
  );
}

export function PlazaSegment({ active, reducedDetail = false, selectedDinnerId }: PlazaSegmentProps & { reducedDetail?: boolean }) {
  const { metalnessMap, woodNormalMap, woodRoughnessMap } = useSurfaceMaps();
  const surfaces = useWorldAssets();

  return (
    <>
      <ScenicPlate opacity={reducedDetail ? 0.78 : 1} path="/world/plaza-courtyard-night.svg" position={[1.8, 8.2, -76.4]} scale={[36.2, 18.8, 1]} />
      <mesh position={[1.8, 7.9, -74.1]}>
        <planeGeometry args={[34, 8.2]} />
        <meshBasicMaterial color="#ffc89b" opacity={active ? 0.12 : 0.06} transparent />
      </mesh>

      <group position={[1, -0.01, -64.4]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[34, 36]} />
          {reducedDetail ? (
            <meshPhysicalMaterial clearcoat={0.24} clearcoatRoughness={0.34} color="#332224" envMapIntensity={0.98} map={surfaces.asphaltFloorColor} metalness={0.16} metalnessMap={metalnessMap} normalMap={surfaces.asphaltFloorNormal} normalScale={new THREE.Vector2(-0.12, -0.12)} roughness={0.4} roughnessMap={surfaces.asphaltFloorRoughness} />
          ) : (
            <MeshReflectorMaterial
              blur={[220, 72]}
              color="#20171a"
              depthScale={0.42}
              envMapIntensity={1.5}
              map={surfaces.asphaltFloorColor}
              metalnessMap={metalnessMap}
              metalness={0.42}
              mirror={0.3}
              mixBlur={1.2}
              mixStrength={15}
              normalMap={surfaces.asphaltFloorNormal}
              normalScale={new THREE.Vector2(-0.18, -0.18)}
              resolution={512}
              roughnessMap={surfaces.asphaltFloorRoughness}
              roughness={0.28}
            />
          )}
        </mesh>

        {[-14.9, 14.9].map((x) => (
          <mesh key={x} position={[x, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.8, 36]} />
            <meshStandardMaterial color="#cdc3bb" envMapIntensity={0.92} map={surfaces.concreteSidewalkColor} normalMap={surfaces.concreteSidewalkNormal} normalScale={new THREE.Vector2(0.16, 0.16)} roughness={0.94} roughnessMap={surfaces.concreteSidewalkRoughness} />
          </mesh>
        ))}

        {[-9.2, 9.2].map((x) => (
          <mesh castShadow key={`plaza-curb-${x}`} position={[x, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.08, 35.4, 10, 18]} />
            <meshStandardMaterial color="#84736a" roughness={0.74} />
          </mesh>
        ))}

        <mesh position={[1.8, 0.03, -1.6]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13.6, 12.8]} />
          <meshStandardMaterial color="#d5c8bf" envMapIntensity={0.94} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.14, 0.14)} roughness={0.9} roughnessMap={surfaces.concreteWallRoughness} />
        </mesh>
      </group>

      {backdropBuildings.map((building) => (
        <WarmFacade
          accent={building.accent}
          cue={building.cue}
          emphasized={false}
          key={`${building.label}-${building.position[0]}`}
          label={building.label}
          position={building.position as [number, number, number]}
          scale={building.scale}
          surfaces={surfaces}
          tone={building.tone}
        />
      ))}

      {dinnerBuildings.map((building) => (
        <WarmFacade
          accent={building.accent}
          cue={building.cue}
          emphasized={selectedDinnerId === building.id}
          key={building.id}
          label={building.label}
          position={building.position as [number, number, number]}
          scale={building.scale}
          surfaces={surfaces}
          tone={building.tone}
        />
      ))}

      <Fountain active={active} />

      <PlazaLamp position={[-11.2, 0, -54.2]} />
      <PlazaLamp position={[11.5, 0, -55.2]} />
      <PlazaLamp position={[-11.4, 0, -68.8]} />
      <PlazaLamp position={[11.6, 0, -70]} />
      <PlazaLamp position={[-8.1, 0, -77.6]} />
      <PlazaLamp position={[8.8, 0, -78.4]} />

      <BillboardTree glowColor="#ffc9af" glowIntensity={0.22} map={surfaces.treeBillboard} position={[-10.6, 0, -58.6]} scale={1.18} tint="#ffdfe9" />
      <BillboardTree glowColor="#ffc9af" glowIntensity={0.22} map={surfaces.treeBillboard} position={[10.3, 0, -59.2]} scale={1.14} tint="#ffe1ea" />
      <BillboardTree glowColor="#ffc9af" glowIntensity={0.18} map={surfaces.treeBillboard} position={[-11.2, 0, -71.8]} scale={1.02} tint="#ffe4ec" />
      <BillboardTree glowColor="#ffc9af" glowIntensity={0.18} map={surfaces.treeBillboard} position={[10.9, 0, -72.8]} scale={1.04} tint="#ffe4eb" />

      <TerraceSet position={[-8.6, 0, -63.8]} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />
      <TerraceSet position={[8.7, 0, -65.6]} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />
      <TerraceSet position={[1.4, 0, -75.2]} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />
      <DiningSet position={[-2.8, 0, -68.6]} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />
      <DiningSet position={[4.9, 0, -71.8]} woodNormalMap={woodNormalMap} woodRoughnessMap={woodRoughnessMap} />

      <mesh position={[1.8, 5.8, -67.2]}>
        <planeGeometry args={[34, 24]} />
        <meshBasicMaterial color="#ffb47a" opacity={0.08} transparent />
      </mesh>

      <Sparkles color="#ffd3a8" count={reducedDetail ? 16 : 36} opacity={active ? 0.18 : 0.08} position={[1.8, 4.8, -66.4]} scale={[26, 5, 30]} size={2.8} speed={0.1} />
    </>
  );
}
