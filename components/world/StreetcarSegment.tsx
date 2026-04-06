"use client";

import { MeshReflectorMaterial, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { BillboardTree } from "@/components/world/BillboardTree";
import { ScenicPlate } from "@/components/world/ScenicPlate";
import { useSurfaceMaps } from "@/components/world/useSurfaceMaps";
import { useWorldAssets } from "@/components/world/useWorldAssets";

type StreetcarSurfaceAssets = ReturnType<typeof useWorldAssets>;

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3.9, 18]} />
        <meshStandardMaterial color="#23262e" metalness={0.36} roughness={0.66} />
      </mesh>
      <mesh castShadow position={[0.28, 3.48, 0]} rotation={[0, 0, Math.PI / 2.8]}>
        <cylinderGeometry args={[0.02, 0.025, 0.58, 10]} />
        <meshStandardMaterial color="#23262e" metalness={0.32} roughness={0.62} />
      </mesh>
      <mesh position={[0.5, 3.42, 0]}>
        <sphereGeometry args={[0.18, 18, 18]} />
        <meshStandardMaterial color="#ffd8b2" emissive="#f6b165" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight color="#ffbc73" distance={11} intensity={1.9} position={[0.46, 3.36, 0.08]} />
    </group>
  );
}

function Skyline({ surfaces }: { surfaces: StreetcarSurfaceAssets }) {
  const towers = [
    { x: -9.4, y: 9.2, z: -58, scale: [1.7, 1.08, 1.1], tone: "#272a34" },
    { x: -5.3, y: 7.9, z: -55, scale: [1.4, 0.96, 0.96], tone: "#222731" },
    { x: -1.3, y: 9.8, z: -59, scale: [1.15, 1.18, 0.92], tone: "#2a2f39" },
    { x: 2.4, y: 10.5, z: -57, scale: [1.56, 1.22, 1.06], tone: "#252a33" },
    { x: 6.7, y: 8.6, z: -56, scale: [1.82, 1.02, 1.18], tone: "#292d37" }
  ];

  return (
    <group>
      {towers.map((tower, index) => (
        <group key={`${tower.x}-${tower.z}`}>
          <mesh castShadow position={[tower.x, tower.y / 2, tower.z]} scale={tower.scale as [number, number, number]}>
            <capsuleGeometry args={[1.08, tower.y - 2.4, 12, 22]} />
            <meshStandardMaterial color={tower.tone} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.18, 0.18)} roughness={0.92} roughnessMap={surfaces.concreteWallRoughness} />
          </mesh>
          <mesh position={[tower.x, tower.y + 0.22, tower.z]} scale={[tower.scale[0] * 0.78, 0.44, tower.scale[2] * 0.78]}>
            <sphereGeometry args={[0.72, 18, 18]} />
            <meshStandardMaterial color={index % 2 === 0 ? "#343a48" : "#303645"} roughness={0.76} />
          </mesh>
          {Array.from({ length: 5 }).map((_, row) => (
            <mesh key={row} position={[tower.x, tower.y - 0.9 - row * 1.75, tower.z + tower.scale[2] * 1.36]}>
              <planeGeometry args={[tower.scale[0] * 1.32, 0.28]} />
              <meshBasicMaterial color="#ffdbae" opacity={0.14 + row * 0.025} transparent />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Facade({
  accent,
  position,
  scale,
  sign,
  surfaces,
  tone,
  warm = false
}: {
  accent: string;
  position: [number, number, number];
  scale: [number, number, number];
  sign: string;
  surfaces: StreetcarSurfaceAssets;
  tone: string;
  warm?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 2.58, 0]} scale={[1.52, 1.14, 0.78]}>
        <capsuleGeometry args={[1.24, 2.96, 12, 22]} />
        <meshStandardMaterial color={tone} envMapIntensity={0.62} map={surfaces.brickFacadeColor} normalMap={surfaces.brickFacadeNormal} normalScale={new THREE.Vector2(0.2, 0.2)} roughness={0.9} roughnessMap={surfaces.brickFacadeRoughness} />
      </mesh>
      <mesh castShadow position={[0, 0.86, 0.96]} scale={[1.68, 0.72, 0.28]}>
        <capsuleGeometry args={[1.06, 1.42, 12, 20]} />
        <meshStandardMaterial color="#d3cbca" envMapIntensity={0.48} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.14, 0.14)} roughness={0.84} roughnessMap={surfaces.concreteWallRoughness} />
      </mesh>

      <mesh castShadow position={[0, 1.38, 1.1]} rotation={[Math.PI / 2, 0, 0]} scale={[1.1, 1, 1]}>
        <cylinderGeometry args={[1.04, 1.16, 0.26, 24, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color={accent} roughness={0.58} />
      </mesh>

      {[-0.98, 0, 0.98].map((x, index) => (
        <mesh key={index} position={[x, 0.7, 1.14]} scale={[0.78, 1.08, 1]}>
          <planeGeometry args={[0.72, 1.02]} />
          <meshBasicMaterial color={warm ? "#ffd7a8" : "#dce9ff"} opacity={0.24} transparent />
        </mesh>
      ))}

      {[-1.02, -0.06, 0.9].map((x, index) => (
        <mesh key={`upper-${index}`} position={[x, 2.92, 1.06]} scale={[0.82, 1.12, 1]}>
          <planeGeometry args={[0.68, 1.04]} />
          <meshBasicMaterial color={warm ? "#ffc98f" : "#d9e7ff"} opacity={0.16} transparent />
        </mesh>
      ))}

      <mesh position={[0, 1.82, 1.18]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.12, 0.34]} />
        <meshBasicMaterial color="#fff3e4" opacity={0.76} transparent />
      </mesh>
      <Text color="#fff5e7" fontSize={0.2} maxWidth={2.8} position={[0, 1.82, 1.2]} textAlign="center">
        {sign}
      </Text>
    </group>
  );
}

function StreetcarShelter() {
  return (
    <group position={[3.88, 0, -23.6]}>
      <mesh castShadow position={[0, 1.34, 0]} scale={[1.2, 0.18, 0.66]}>
        <capsuleGeometry args={[0.78, 1.1, 10, 18]} />
        <meshStandardMaterial color="#22262e" roughness={0.58} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh castShadow key={x} position={[x, 0.72, 0.36]}>
          <capsuleGeometry args={[0.045, 1.2, 8, 14]} />
          <meshStandardMaterial color="#262b32" roughness={0.58} />
        </mesh>
      ))}
      <mesh position={[0, 0.76, 0.06]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.72, 1.08]} />
        <meshStandardMaterial color="#d9e7ff" emissive="#8fb8e9" emissiveIntensity={0.16} transparent opacity={0.16} />
      </mesh>
      <mesh castShadow position={[0, 0.26, -0.12]} scale={[0.92, 0.12, 0.22]}>
        <capsuleGeometry args={[0.66, 0.2, 10, 18]} />
        <meshStandardMaterial color="#2d3139" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.62, 0.06]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.94, 0.18]} />
        <meshBasicMaterial color="#fff5e6" opacity={0.78} transparent />
      </mesh>
    </group>
  );
}

function Planter({ position, surfaces }: { position: [number, number, number]; surfaces: StreetcarSurfaceAssets }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.26, 0]} scale={[1.24, 0.42, 0.88]}>
        <capsuleGeometry args={[0.48, 0.8, 10, 18]} />
        <meshStandardMaterial color="#7e736d" envMapIntensity={0.42} map={surfaces.concreteWallColor} normalMap={surfaces.concreteWallNormal} normalScale={new THREE.Vector2(0.1, 0.1)} roughness={0.88} roughnessMap={surfaces.concreteWallRoughness} />
      </mesh>
      <mesh position={[0, 0.56, 0]} scale={[0.96, 0.42, 0.74]}>
        <sphereGeometry args={[0.54, 18, 18]} />
        <meshStandardMaterial color="#2b4732" roughness={0.96} />
      </mesh>
    </group>
  );
}

export function StreetcarSegment({ plazaActive = false, reducedDetail = false }: { plazaActive?: boolean; reducedDetail?: boolean }) {
  const { metalnessMap } = useSurfaceMaps();
  const surfaces = useWorldAssets();
  const leftLamps = Array.from({ length: 8 }, (_, index) => [-5.9, 0, 14 - index * 8] as [number, number, number]);
  const rightLamps = Array.from({ length: 8 }, (_, index) => [5.8, 0, 10 - index * 8] as [number, number, number]);

  return (
    <>
      <group position={[0, -0.01, -12]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9.4, 86]} />
          {reducedDetail ? (
            <meshPhysicalMaterial clearcoat={0.24} clearcoatRoughness={0.36} color="#2b2526" envMapIntensity={0.94} map={surfaces.asphaltRoadColor} metalness={0.18} metalnessMap={metalnessMap} normalMap={surfaces.asphaltRoadNormal} normalScale={new THREE.Vector2(-0.12, -0.12)} roughness={0.42} roughnessMap={surfaces.asphaltRoadRoughness} />
          ) : (
            <MeshReflectorMaterial
              blur={[220, 72]}
              color="#16151b"
              depthScale={0.46}
              envMapIntensity={1.45}
              map={surfaces.asphaltRoadColor}
              metalnessMap={metalnessMap}
              metalness={0.46}
              mirror={0.34}
              mixBlur={1.35}
              mixStrength={16}
              normalMap={surfaces.asphaltRoadNormal}
              normalScale={new THREE.Vector2(-0.2, -0.2)}
              resolution={512}
              roughnessMap={surfaces.asphaltRoadRoughness}
              roughness={0.24}
            />
          )}
        </mesh>

        {[-6.52, 6.52].map((x) => (
          <mesh key={x} position={[x, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.82, 86]} />
            <meshStandardMaterial color="#bcb8b7" envMapIntensity={0.8} map={surfaces.concreteSidewalkColor} normalMap={surfaces.concreteSidewalkNormal} normalScale={new THREE.Vector2(0.18, 0.18)} roughness={0.92} roughnessMap={surfaces.concreteSidewalkRoughness} />
          </mesh>
        ))}

        {[-4.74, 4.74].map((x) => (
          <mesh castShadow key={`curb-${x}`} position={[x, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.08, 85.2, 10, 18]} />
            <meshStandardMaterial color="#66666c" roughness={0.68} />
          </mesh>
        ))}

        {[-0.86, 0.86].map((x) => (
          <mesh key={`rail-${x}`} position={[x, 0.05, -6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 72, 14]} />
            <meshStandardMaterial color="#7e858d" envMapIntensity={1.62} metalness={0.82} metalnessMap={metalnessMap} roughness={0.24} roughnessMap={surfaces.concreteWallRoughness} />
          </mesh>
        ))}

        {Array.from({ length: 12 }).map((_, index) => (
          <mesh key={`tie-${index}`} position={[0, -0.005, 15 - index * 6]} receiveShadow rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.22, 1]}>
            <capsuleGeometry args={[0.12, 1.94, 8, 16]} />
            <meshStandardMaterial color="#4d4037" roughness={0.9} />
          </mesh>
        ))}

        {[-2.92, 2.92].map((x) => (
          <mesh key={`lane-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.05, -2]}>
            <planeGeometry args={[0.06, 22]} />
            <meshBasicMaterial color="#f2b36d" opacity={0.2} transparent />
          </mesh>
        ))}
      </group>

      {leftLamps.map((position, index) => (
        <Lamp key={`left-lamp-${index}`} position={position} />
      ))}
      {rightLamps.map((position, index) => (
        <Lamp key={`right-lamp-${index}`} position={position} />
      ))}

      {!plazaActive ? <Skyline surfaces={surfaces} /> : null}

      {!plazaActive ? (
        <>
          <ScenicPlate opacity={0.88} path="/world/main-street-night.svg" position={[0.18, 9.3, -42.2]} scale={[42.5, 22.4, 1]} />
        </>
      ) : null}

      <Facade accent="#6f4742" position={[-7.2, 0, -10]} scale={[1.08, 1, 1]} sign="LATE HOURS" surfaces={surfaces} tone="#9b7a6d" warm />
      <Facade accent="#2e5273" position={[-7.1, 0, -22]} scale={[0.96, 1.08, 1]} sign="JAZZ ROOM" surfaces={surfaces} tone="#8e9096" />
      <Facade accent="#865048" position={[7.15, 0, -12]} scale={[1, 1.06, 1]} sign="CITY TABLE" surfaces={surfaces} tone="#a18274" warm />
      <Facade accent="#3f5c7c" position={[7.22, 0, -24]} scale={[1.02, 1, 1]} sign="STREETCAR STOP" surfaces={surfaces} tone="#8f9299" />

      {!plazaActive ? <Facade accent="#5d4138" position={[-7.35, 0, -33]} scale={[1.08, 1.2, 1]} sign="MAIN STREET" surfaces={surfaces} tone="#9a7b6e" warm /> : null}
      {!plazaActive ? <Facade accent="#805545" position={[7.38, 0, -35]} scale={[1.1, 1.16, 1]} sign="NIGHT MARKET" surfaces={surfaces} tone="#9d7e72" warm /> : null}

      {!plazaActive ? <StreetcarShelter /> : null}

      <BillboardTree glowColor="#ffceb7" glowIntensity={0.18} map={surfaces.treeBillboard} position={[-6.68, 0, 4]} scale={0.98} tint="#ffe4eb" />
      <BillboardTree glowColor="#ffceb7" glowIntensity={0.16} map={surfaces.treeBillboard} position={[6.84, 0, -3]} scale={0.92} tint="#ffe3e9" />
      {!plazaActive ? <BillboardTree glowColor="#ffceb7" glowIntensity={0.16} map={surfaces.treeBillboard} position={[6.38, 0, -20]} scale={1.04} tint="#ffe3ea" /> : null}

      <Planter position={[-5.56, 0, 6.4]} surfaces={surfaces} />
      <Planter position={[5.62, 0, -9.6]} surfaces={surfaces} />

      <mesh position={[0, 6.4, -18]}>
        <planeGeometry args={[22, 16]} />
        <meshBasicMaterial color="#3c3243" opacity={0.12} transparent />
      </mesh>

      <Sparkles color="#ffd1ac" count={reducedDetail ? 12 : 36} opacity={0.1} position={[0, 4.6, -12]} scale={[14, 6, 54]} size={2.4} speed={0.12} />
    </>
  );
}
