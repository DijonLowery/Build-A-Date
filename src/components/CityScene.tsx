"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store";
import CharacterPair from "./CharacterPair";
import CameraRig from "./CameraRig";

// World phase Z positions — each stop is a KC landmark
const PHASE_POSITIONS: Record<string, number> = {
  start: 8,
  mainStreet: -4,
  dinner: -24,
  activity: -46,
  drinks: -66,
  reveal: -80,
};

export { PHASE_POSITIONS };

/* ------------------------------------------------------------------ */
/*  Shared materials — reuse instead of creating per-building          */
/* ------------------------------------------------------------------ */
const BRICK_COLOR = "#c8a088";
const PLASTER_COLOR = "#e0d0c0";
const MODERN_COLOR = "#506878";
const WINDOW_COLOR = "#ffd088";
const DARK_TRIM = "#5a4a3a";

/* ------------------------------------------------------------------ */
/*  Sunset Sky (HDRI)                                                  */
/* ------------------------------------------------------------------ */
function SunsetSky() {
  return (
    <Environment
      files="/models/sky_golden.hdr"
      background
      backgroundBlurriness={0}
      environmentIntensity={0.9}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Ground — cobblestone textured                                      */
/* ------------------------------------------------------------------ */
function Ground() {
  const [diffMap, normalMap] = useTexture([
    "/models/cobblestone_diff.jpg",
    "/models/cobblestone_normal.jpg",
  ]);

  [diffMap, normalMap].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 80);
  });

  return (
    <group>
      {/* Main walkway */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -35]}>
        <planeGeometry args={[5, 100]} />
        <meshStandardMaterial
          map={diffMap} normalMap={normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.75} metalness={0.05} color="#c8a888"
        />
      </mesh>
      {/* Sidewalks */}
      <mesh rotation-x={-Math.PI / 2} position={[-4.5, 0, -35]}>
        <planeGeometry args={[4, 100]} />
        <meshStandardMaterial color="#b8a090" roughness={0.85} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[4.5, 0, -35]}>
        <planeGeometry args={[4, 100]} />
        <meshStandardMaterial color="#b8a090" roughness={0.85} />
      </mesh>
      {/* Subtle golden reflection on wet cobblestone */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -35]}>
        <planeGeometry args={[5, 100]} />
        <meshStandardMaterial color="#ffcc66" roughness={0.2} metalness={0.4} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared textures hook                                               */
/* ------------------------------------------------------------------ */
function useBuildingTextures() {
  const [brickDiff, brickNorm, plasterDiff, plasterNorm] = useTexture([
    "/models/brick_diff.jpg",
    "/models/brick_normal.jpg",
    "/models/plaster_diff.jpg",
    "/models/plaster_normal.jpg",
  ]);
  [brickDiff, brickNorm, plasterDiff, plasterNorm].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  });
  return { brickDiff, brickNorm, plasterDiff, plasterNorm };
}

/* ------------------------------------------------------------------ */
/*  Textured Building — real materials, architectural detail            */
/* ------------------------------------------------------------------ */
function Building({ position, width, height, depth, style, windowGlow = 0.5 }: {
  position: [number, number, number];
  width: number; height: number; depth: number;
  style: "brick" | "plaster" | "modern";
  windowGlow?: number;
}) {
  const { brickDiff, brickNorm, plasterDiff, plasterNorm } = useBuildingTextures();
  const baseColor = style === "brick" ? BRICK_COLOR : style === "plaster" ? PLASTER_COLOR : MODERN_COLOR;
  const isModern = style === "modern";

  const texMap = style === "brick" ? brickDiff : plasterDiff;
  const normMap = style === "brick" ? brickNorm : plasterNorm;

  const map = useMemo(() => {
    const t = texMap.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width * 0.7, height * 0.4);
    t.needsUpdate = true;
    return t;
  }, [texMap, width, height]);

  const nMap = useMemo(() => {
    const t = normMap.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width * 0.7, height * 0.4);
    t.needsUpdate = true;
    return t;
  }, [normMap, width, height]);

  const windows = useMemo(() => {
    const wins: { x: number; y: number }[] = [];
    const cols = Math.max(1, Math.floor(width / 1.1));
    const rows = Math.max(1, Math.floor((height - 1) / 1.4));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        wins.push({
          x: -width / 2 + 0.55 + c * (width / cols),
          y: 1.4 + r * 1.4,
        });
      }
    }
    return wins;
  }, [width, height]);

  return (
    <group position={position}>
      {/* Main body — textured */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        {isModern ? (
          <meshStandardMaterial color={baseColor} roughness={0.15} metalness={0.7} envMapIntensity={1.5} />
        ) : (
          <meshStandardMaterial
            map={map} normalMap={nMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            color={baseColor} roughness={0.75} metalness={0.05} envMapIntensity={0.3}
          />
        )}
      </mesh>
      {/* Cornice / roofline */}
      <mesh position={[0, height + 0.08, depth * 0.03]}>
        <boxGeometry args={[width + 0.12, 0.14, depth + 0.08]} />
        <meshStandardMaterial color={style === "brick" ? "#8a7060" : "#c0b0a0"} roughness={0.6} />
      </mesh>
      {/* Foundation strip */}
      <mesh position={[0, 0.12, depth * 0.02]}>
        <boxGeometry args={[width + 0.06, 0.24, depth + 0.04]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.8} />
      </mesh>
      {/* Windows with frames */}
      {windows.map((w, i) => (
        <group key={i}>
          {/* Frame (recessed dark border) */}
          <mesh position={[w.x, w.y, depth / 2 + 0.005]}>
            <planeGeometry args={[0.55, 0.75]} />
            <meshStandardMaterial color="#3a3028" roughness={0.8} />
          </mesh>
          {/* Glass pane — emissive for bloom */}
          <mesh position={[w.x, w.y, depth / 2 + 0.01]}>
            <planeGeometry args={[0.45, 0.65]} />
            <meshStandardMaterial
              color={isModern ? "#88bbdd" : WINDOW_COLOR}
              emissive={isModern ? "#aaddff" : "#ffaa44"}
              emissiveIntensity={windowGlow}
              metalness={isModern ? 0.5 : 0.1}
              roughness={isModern ? 0.05 : 0.4}
            />
          </mesh>
        </group>
      ))}
      {/* Awning over storefront */}
      <mesh position={[0, 1.1, depth / 2 + 0.2]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[width - 0.3, 0.4]} />
        <meshStandardMaterial color="#8a3030" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Storefront glow */}
      <mesh position={[0, 0.55, depth / 2 + 0.01]}>
        <planeGeometry args={[width - 0.4, 0.8]} />
        <meshStandardMaterial
          color="#ffcc88" emissive="#ff9944"
          emissiveIntensity={windowGlow * 0.8}
          transparent opacity={0.5}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Street lamp — NO point light, emissive globe + bloom does the work */
/* ------------------------------------------------------------------ */
function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 3, 6]} />
        <meshStandardMaterial color="#2a2018" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Globe — bloom makes this glow */}
      <mesh position={[0, 3.15, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial
          color="#ffeedd" emissive="#ffcc66" emissiveIntensity={3}
          transparent opacity={0.95}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Tree — simplified                                                  */
/* ------------------------------------------------------------------ */
function WarmTree({ position, color = "#4a7040" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 1.4, 5]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.7, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Street furniture — benches, curbs, crosswalks, neon signs          */
/* ------------------------------------------------------------------ */
function StreetFurniture() {
  return useMemo(() => {
    const items: React.ReactElement[] = [];

    // Curbs along both sides
    items.push(
      <mesh key="curb-l" position={[-2.6, 0.06, -35]}>
        <boxGeometry args={[0.15, 0.12, 100]} />
        <meshStandardMaterial color="#908070" roughness={0.8} />
      </mesh>,
      <mesh key="curb-r" position={[2.6, 0.06, -35]}>
        <boxGeometry args={[0.15, 0.12, 100]} />
        <meshStandardMaterial color="#908070" roughness={0.8} />
      </mesh>
    );

    // Crosswalks at each stop
    const stops = [-4, -24, -46, -66];
    stops.forEach((z, si) => {
      for (let s = -3; s <= 3; s++) {
        items.push(
          <mesh key={`cw-${si}-${s}`} rotation-x={-Math.PI / 2} position={[s * 0.6, 0.001, z]}>
            <planeGeometry args={[0.35, 1.8]} />
            <meshStandardMaterial color="#ddd8cc" transparent opacity={0.6} roughness={0.9} />
          </mesh>
        );
      }
    });

    // Benches every few blocks
    for (let i = 0; i < 8; i++) {
      const z = 4 - i * 10;
      const side = i % 2 === 0 ? -3.2 : 3.2;
      items.push(
        <group key={`bench-${i}`} position={[side, 0, z]}>
          {/* Seat */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.8, 0.06, 0.35]} />
            <meshStandardMaterial color="#5a3a20" roughness={0.8} />
          </mesh>
          {/* Legs */}
          <mesh position={[-0.3, 0.17, 0]}>
            <boxGeometry args={[0.05, 0.34, 0.3]} />
            <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0.3, 0.17, 0]}>
            <boxGeometry args={[0.05, 0.34, 0.3]} />
            <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      );
    }

    // Neon signs on buildings — bloom makes these pop
    const neonSigns = [
      { pos: [-5.2, 3.5, 2] as [number, number, number], color: "#ff6688", text: true },
      { pos: [5.8, 4, -8] as [number, number, number], color: "#66aaff", text: true },
      { pos: [-5.5, 2.5, -18] as [number, number, number], color: "#ffaa33", text: true },
      { pos: [5.5, 3, -30] as [number, number, number], color: "#ff4466", text: true },
      { pos: [-5.3, 2.8, -40] as [number, number, number], color: "#33ffaa", text: true },
      { pos: [5.6, 3.5, -55] as [number, number, number], color: "#ff66cc", text: true },
      { pos: [-5.4, 2, -60] as [number, number, number], color: "#ffcc44", text: true },
      { pos: [5.3, 2.5, -70] as [number, number, number], color: "#6666ff", text: true },
    ];
    neonSigns.forEach((s, i) => {
      items.push(
        <mesh key={`neon-${i}`} position={s.pos}>
          <planeGeometry args={[1.2, 0.3]} />
          <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={3} />
        </mesh>
      );
    });

    // Fire hydrants
    for (let i = 0; i < 6; i++) {
      const z = 2 - i * 14;
      items.push(
        <mesh key={`hydrant-${i}`} position={[2.8, 0.2, z]}>
          <cylinderGeometry args={[0.06, 0.08, 0.4, 6]} />
          <meshStandardMaterial color="#cc3333" roughness={0.7} />
        </mesh>
      );
    }

    return <>{items}</>;
  }, []);
}

/* ------------------------------------------------------------------ */
/*  KC Landmark: Country Club Plaza — Spanish towers                   */
/* ------------------------------------------------------------------ */
function PlazaTower({ position, side }: { position: [number, number, number]; side: "left" | "right" }) {
  const m = side === "right" ? -1 : 1;
  return (
    <group position={position}>
      {/* Tower */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[1.8, 10, 1.8]} />
        <meshStandardMaterial color="#d4a574" roughness={0.7} envMapIntensity={0.5} />
      </mesh>
      {/* Dome */}
      <mesh position={[0, 10.5, 0]}>
        <sphereGeometry args={[0.7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b87040" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, 11.3, 0]}>
        <coneGeometry args={[0.08, 0.8, 5]} />
        <meshStandardMaterial color="#8a6030" metalness={0.5} />
      </mesh>
      {/* Terracotta roof accent */}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[2.0, 0.2, 2.0]} />
        <meshStandardMaterial color="#b85533" roughness={0.7} />
      </mesh>
      {/* Arched windows — emissive for bloom */}
      {[3, 5, 7, 9].map((y, i) => (
        <mesh key={i} position={[0, y, 0.92]}>
          <planeGeometry args={[0.5, 0.8]} />
          <meshStandardMaterial color="#ffd088" emissive="#ffaa44" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Wing building */}
      <mesh position={[m * 1.8, 2.5, 0]}>
        <boxGeometry args={[2, 5, 2.5]} />
        <meshStandardMaterial color="#ddb888" roughness={0.7} envMapIntensity={0.4} />
      </mesh>
      <mesh position={[m * 1.8, 5.1, 0]}>
        <boxGeometry args={[2.3, 0.2, 2.8]} />
        <meshStandardMaterial color="#b85533" roughness={0.7} />
      </mesh>
      {/* Wing storefronts — emissive glow */}
      <mesh position={[m * 1.8, 1.2, 1.27]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#ffcc88" emissive="#ff9944" emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  KC Landmark: Union Station — grand arched entrance                 */
/* ------------------------------------------------------------------ */
function UnionStationLandmark({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main facade */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[10, 8, 2]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.7} envMapIntensity={0.5} />
      </mesh>
      {/* Grand arch */}
      <mesh position={[0, 3.5, 1.02]}>
        <planeGeometry args={[3, 4.5]} />
        <meshStandardMaterial color="#2a2020" />
      </mesh>
      {/* Warm glow inside arch — bloom makes this radiate */}
      <mesh position={[0, 3.5, 1.03]}>
        <planeGeometry args={[2.6, 4]} />
        <meshStandardMaterial color="#ffcc88" emissive="#ffaa55" emissiveIntensity={1.2} transparent opacity={0.4} />
      </mesh>
      {/* Side arches */}
      {[-2.5, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 2.5, 1.02]}>
          <planeGeometry args={[1.5, 3]} />
          <meshStandardMaterial color="#ffdd99" emissive="#ffaa44" emissiveIntensity={0.6} transparent opacity={0.3} />
        </mesh>
      ))}
      {/* Roofline */}
      <mesh position={[0, 8.2, 0]}>
        <boxGeometry args={[10.5, 0.4, 2.3]} />
        <meshStandardMaterial color="#c0b090" roughness={0.6} />
      </mesh>
      {/* Clock tower */}
      <mesh position={[0, 9.5, 0]}>
        <boxGeometry args={[2, 2.5, 1.5]} />
        <meshStandardMaterial color="#c8b898" roughness={0.6} />
      </mesh>
      {/* Clock face — emissive bloom */}
      <mesh position={[0, 9.8, 0.77]}>
        <circleGeometry args={[0.6, 12]} />
        <meshStandardMaterial color="#eee8d8" emissive="#ffddaa" emissiveIntensity={1} />
      </mesh>
      {/* Grand steps */}
      {[0, 0.15, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 1.3 + i * 0.3]}>
          <boxGeometry args={[6 - i * 0.5, 0.15, 0.3]} />
          <meshStandardMaterial color="#c8b898" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  KC Landmark: Power & Light — modern neon entertainment             */
/* ------------------------------------------------------------------ */
function PowerAndLightDistrict({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Glass tower */}
      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[3, 14, 2.5]} />
        <meshStandardMaterial color="#4a6070" roughness={0.1} metalness={0.7} envMapIntensity={1.5} />
      </mesh>
      {/* Glass curtain wall strips */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 1.5 + i * 1.6, 1.27]}>
          <planeGeometry args={[2.7, 0.7]} />
          <meshStandardMaterial
            color="#88bbdd" emissive="#aaddff" emissiveIntensity={0.4}
            metalness={0.8} roughness={0.05}
          />
        </mesh>
      ))}
      {/* Neon LED strips — bloom makes these GLOW */}
      <mesh position={[0, 0.5, 1.28]}>
        <planeGeometry args={[2.8, 0.15]} />
        <meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={4} />
      </mesh>
      <mesh position={[0, 14.2, 1.28]}>
        <planeGeometry args={[2.8, 0.1]} />
        <meshStandardMaterial color="#3366ff" emissive="#3366ff" emissiveIntensity={4} />
      </mesh>
      {/* Entertainment venue */}
      <mesh position={[-3, 3.5, 0.5]}>
        <boxGeometry args={[3, 7, 3]} />
        <meshStandardMaterial color="#505560" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Marquee — neon glow */}
      <mesh position={[-3, 1, 2.1]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[2.5, 0.6]} />
        <meshStandardMaterial color="#ff6644" emissive="#ff4422" emissiveIntensity={3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  KC Landmark: Crossroads Arts District                              */
/* ------------------------------------------------------------------ */
function CrossroadsDistrict({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Warehouse */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[5, 6, 3]} />
        <meshStandardMaterial color="#8a6650" roughness={0.85} />
      </mesh>
      {/* Art mural — colorful */}
      <mesh position={[0, 3.5, 1.52]}>
        <planeGeometry args={[3, 3.5]} />
        <meshStandardMaterial color="#cc5588" emissive="#aa3366" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.5, 4.2, 1.53]}>
        <circleGeometry args={[0.6, 6]} />
        <meshStandardMaterial color="#ffaa33" emissive="#ff8800" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.7, 3, 1.53]}>
        <planeGeometry args={[0.8, 1.5]} />
        <meshStandardMaterial color="#4488cc" emissive="#2266aa" emissiveIntensity={0.4} />
      </mesh>
      {/* Rooftop */}
      <mesh position={[0, 6.15, 0]}>
        <boxGeometry args={[5.2, 0.3, 3.2]} />
        <meshStandardMaterial color="#6a5040" roughness={0.8} />
      </mesh>
      {/* Bar building */}
      <mesh position={[4, 2.5, 0.5]}>
        <boxGeometry args={[3, 5, 2.5]} />
        <meshStandardMaterial color="#7a6a58" roughness={0.8} />
      </mesh>
      {/* Neon bar sign — bloom glow */}
      <mesh position={[4, 2, 1.78]}>
        <planeGeometry args={[1.5, 0.4]} />
        <meshStandardMaterial color="#ff6688" emissive="#ff4466" emissiveIntensity={4} />
      </mesh>
      {/* String lights */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[2.2, 4.5 - i * 0.1, 1.5 - i * 0.2]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshStandardMaterial color="#ffeecc" emissive="#ffcc66" emissiveIntensity={3} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  City blocks — optimized: fewer buildings, no texture cloning       */
/* ------------------------------------------------------------------ */
function CityBlocks() {
  const blocks = useMemo(() => {
    const result: React.ReactElement[] = [];
    const rand = (seed: number) => {
      const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };

    // Reduced from 22 to 14 buildings per side
    for (let i = 0; i < 14; i++) {
      const z = 8 - i * 6.2;
      const seed = i * 13;

      const lh = 3 + rand(seed) * 5;
      const lw = 2.5 + rand(seed + 1) * 1.5;
      const lStyle = i > 10 ? "modern" as const : rand(seed + 2) > 0.5 ? "brick" as const : "plaster" as const;

      result.push(
        <Building key={`bl-${i}`}
          position={[-5.5 - rand(seed + 4) * 0.5, 0, z]}
          width={lw} height={lh} depth={2.5}
          style={lStyle}
          windowGlow={0.4 + rand(seed + 5) * 0.6}
        />
      );

      const rh = 3 + rand(seed + 10) * 5;
      const rw = 2.5 + rand(seed + 11) * 1.5;
      const rStyle = i > 10 ? "modern" as const : rand(seed + 12) > 0.5 ? "brick" as const : "plaster" as const;

      result.push(
        <Building key={`br-${i}`}
          position={[5.5 + rand(seed + 14) * 0.5, 0, z - 3]}
          width={rw} height={rh} depth={2.5}
          style={rStyle}
          windowGlow={0.4 + rand(seed + 15) * 0.6}
        />
      );
    }
    return result;
  }, []);

  return <>{blocks}</>;
}

/* ------------------------------------------------------------------ */
/*  KC Landmarks at each stop                                          */
/* ------------------------------------------------------------------ */
function KCLandmarks() {
  return (
    <>
      <PlazaTower position={[-6, 0, -2]} side="left" />
      <PlazaTower position={[6.5, 0, -5]} side="right" />
      <UnionStationLandmark position={[7, 0, -24]} />
      <PowerAndLightDistrict position={[-6, 0, -46]} />
      <PowerAndLightDistrict position={[6, 0, -48]} />
      <CrossroadsDistrict position={[-6, 0, -66]} />
      <CrossroadsDistrict position={[6.5, 0, -68]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Street details — lamps + trees (reduced count)                     */
/* ------------------------------------------------------------------ */
function StreetDetails() {
  const items = useMemo(() => {
    const result: React.ReactElement[] = [];
    const treeColors = ["#5a8048", "#7a6030", "#6a7838", "#4a6838"];
    // Reduced from 22 to 14
    for (let i = 0; i < 14; i++) {
      const z = 6 - i * 6.2;
      result.push(<StreetLamp key={`sl-${i}`} position={[-2.8, 0, z]} />);
      result.push(<StreetLamp key={`sr-${i}`} position={[2.8, 0, z - 3]} />);
      if (i % 2 === 0) {
        result.push(<WarmTree key={`tl-${i}`} position={[-3.8, 0, z - 1.5]} color={treeColors[i % treeColors.length]} />);
        result.push(<WarmTree key={`tr-${i}`} position={[3.8, 0, z + 1.5]} color={treeColors[(i + 2) % treeColors.length]} />);
      }
    }
    return result;
  }, []);

  return <>{items}</>;
}

/* ------------------------------------------------------------------ */
/*  Warm particles — reduced count                                     */
/* ------------------------------------------------------------------ */
function WarmParticles() {
  const count = 40;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = Math.random() * 5 + 1;
      arr[i * 3 + 2] = Math.random() * -90;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#ffddaa" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Stop markers                                                       */
/* ------------------------------------------------------------------ */
function StopMarker({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).opacity =
        0.3 + Math.sin(clock.elapsedTime * 2) * 0.15;
    }
  });
  return (
    <mesh ref={ref as React.RefObject<THREE.Mesh>} rotation-x={-Math.PI / 2} position={position}>
      <circleGeometry args={[1.2, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.4} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Dreamy glow — subtle atmospheric haze                              */
/* ------------------------------------------------------------------ */
function DreamyGlow() {
  return (
    <group>
      <mesh position={[0, 4, -80]}>
        <sphereGeometry args={[15, 8, 8]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.08} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.3, -35]}>
        <planeGeometry args={[20, 90]} />
        <meshBasicMaterial color="#ffcc88" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  KC Skyline silhouette                                              */
/* ------------------------------------------------------------------ */
function KCSkyline() {
  return (
    <group position={[0, 0, -65]}>
      <mesh position={[-8, 10, 0]}>
        <boxGeometry args={[2, 20, 2]} />
        <meshStandardMaterial color="#2a2535" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[-4, 8, -2]}>
        <boxGeometry args={[2.5, 16, 2]} />
        <meshStandardMaterial color="#3a3040" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[2, 4, -1]}>
        <boxGeometry args={[5, 4, 4]} />
        <meshStandardMaterial color="#383040" roughness={0.5} />
      </mesh>
      <mesh position={[7, 7, 0]}>
        <boxGeometry args={[2, 14, 2]} />
        <meshStandardMaterial color="#2e2838" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[13, 6, 0]}>
        <boxGeometry args={[1.5, 12, 1.5]} />
        <meshStandardMaterial color="#2a2535" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Main scene — only 2 real lights, rest is emissive + bloom          */
/* ------------------------------------------------------------------ */
export default function CityScene() {
  const { worldPhase } = useStore();
  const targetZ = PHASE_POSITIONS[worldPhase] ?? 0;

  return (
    <>
      {/* Minimal lighting — bloom handles the rest */}
      <ambientLight intensity={0.4} color="#ffd0a0" />
      <directionalLight position={[-8, 8, -6]} intensity={1.2} color="#ffbb77" />
      <hemisphereLight color="#ffcc88" groundColor="#8a6644" intensity={0.5} />

      <CameraRig targetZ={targetZ} />
      <SunsetSky />
      <Ground />
      <CityBlocks />
      <KCLandmarks />
      <StreetDetails />
      <StreetFurniture />
      <WarmParticles />
      <DreamyGlow />
      <KCSkyline />

      {/* Stop markers */}
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.mainStreet]} color="#ffcc66" />
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.dinner]} color="#ff9955" />
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.activity]} color="#ff6688" />
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.drinks]} color="#ffaa55" />

      <CharacterPair targetZ={targetZ} />
    </>
  );
}
