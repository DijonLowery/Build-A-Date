"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, useTexture, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store";
import CharacterPair from "./CharacterPair";
import CameraRig from "./CameraRig";

// World phase Z positions
const PHASE_POSITIONS: Record<string, number> = {
  start: 8,
  mainStreet: -8,
  dinner: -36,
  activity: -66,
  drinks: -96,
  reveal: -116,
};

export { PHASE_POSITIONS };

/* ================================================================== */
/*  SHARED ENVIRONMENT                                                 */
/* ================================================================== */
function CityEnvironment() {
  const isMobile = useStore((s) => s.isMobile);
  return (
    <Environment
      files="/hdri/modern_evening_street_1k.hdr"
      background
      backgroundBlurriness={0.02}
      environmentIntensity={isMobile ? 0.7 : 1.0}
    />
  );
}

/* ================================================================== */
/*  GROUND — continuous cobblestone road                               */
/* ================================================================== */
function Ground() {
  const [diffMap, normalMap] = useTexture([
    "/models/cobblestone_diff.jpg",
    "/models/cobblestone_normal.jpg",
  ]);
  [diffMap, normalMap].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 150);
  });

  return (
    <group>
      {/* Wide cobblestone road — boulevard width */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -50]}>
        <planeGeometry args={[12, 180]} />
        <meshStandardMaterial
          map={diffMap} normalMap={normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          roughness={0.78} metalness={0.05} color="#a89080"
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -50]}>
        <planeGeometry args={[12, 180]} />
        <meshStandardMaterial color="#ffcc88" roughness={0.15} metalness={0.3} transparent opacity={0.04} />
      </mesh>
      {/* Sidewalks — wider to match boulevard */}
      {[-7.5, 7.5].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.05, -50]}>
          <planeGeometry args={[4, 180]} />
          <meshStandardMaterial color="#9a8a7a" roughness={0.85} metalness={0.02} />
        </mesh>
      ))}
      {/* Curb lines */}
      {[-5.2, 5.2].map((x) => (
        <mesh key={`c-${x}`} position={[x, 0.04, -50]}>
          <boxGeometry args={[0.18, 0.1, 180]} />
          <meshStandardMaterial color="#8a7a6a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ================================================================== */
/*  BUILDING FACADE — textured brick/plaster                           */
/* ================================================================== */
function BuildingFacade({ position, width, height, depth, style, windowGlow = 0.5 }: {
  position: [number, number, number]; width: number; height: number; depth: number;
  style: "brick" | "plaster" | "modern"; windowGlow?: number;
}) {
  const [brickDiff, brickNorm, plasterDiff, plasterNorm] = useTexture([
    "/models/brick_diff.jpg", "/models/brick_normal.jpg",
    "/models/plaster_diff.jpg", "/models/plaster_normal.jpg",
  ]);
  const isModern = style === "modern";
  const texMap = style === "brick" ? brickDiff : plasterDiff;
  const normMap = style === "brick" ? brickNorm : plasterNorm;

  const map = useMemo(() => {
    const t = texMap.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width * 0.5, height * 0.3); t.needsUpdate = true; return t;
  }, [texMap, width, height]);
  const nMap = useMemo(() => {
    const t = normMap.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width * 0.5, height * 0.3); t.needsUpdate = true; return t;
  }, [normMap, width, height]);

  const windows = useMemo(() => {
    const wins: { x: number; y: number }[] = [];
    const cols = Math.max(1, Math.floor(width / 1.4));
    const rows = Math.max(1, Math.floor((height - 2) / 1.6));
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        wins.push({ x: -width / 2 + 0.7 + c * (width / cols), y: 2.0 + r * 1.6 });
    return wins;
  }, [width, height]);

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        {isModern ? (
          <meshStandardMaterial color="#405060" roughness={0.1} metalness={0.8} envMapIntensity={2} />
        ) : (
          <meshStandardMaterial map={map} normalMap={nMap} normalScale={new THREE.Vector2(0.4, 0.4)}
            color={style === "brick" ? "#c0a088" : "#d8c8b8"} roughness={0.75} metalness={0.03} envMapIntensity={0.5} />
        )}
      </mesh>
      <mesh position={[0, height + 0.06, depth * 0.03]}>
        <boxGeometry args={[width + 0.1, 0.12, depth + 0.06]} />
        <meshStandardMaterial color={style === "brick" ? "#7a6050" : "#b0a090"} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.15, depth * 0.02]}>
        <boxGeometry args={[width + 0.04, 0.3, depth + 0.04]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.85} />
      </mesh>
      {windows.map((w, i) => (
        <group key={i}>
          <mesh position={[w.x, w.y, depth / 2 + 0.005]}>
            <planeGeometry args={[0.6, 0.85]} />
            <meshStandardMaterial color="#2a2018" roughness={0.8} />
          </mesh>
          <mesh position={[w.x, w.y, depth / 2 + 0.01]}>
            <planeGeometry args={[0.5, 0.72]} />
            <meshStandardMaterial color={isModern ? "#88bbdd" : "#ffd088"}
              emissive={isModern ? "#88bbdd" : "#ffaa44"} emissiveIntensity={windowGlow}
              metalness={isModern ? 0.5 : 0.1} roughness={isModern ? 0.05 : 0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.7, depth / 2 + 0.01]}>
        <planeGeometry args={[width - 0.6, 1.1]} />
        <meshStandardMaterial color="#ffcc88" emissive="#ff9944" emissiveIntensity={windowGlow * 0.6} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 1.35, depth / 2 + 0.25]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[width - 0.4, 0.5]} />
        <meshStandardMaterial color="#6a2020" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ================================================================== */
/*  REAL GLB STREET LAMP                                               */
/* ================================================================== */
function RealStreetLamp({ position, scale = 1.8 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF("/models/street-lamp.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);
  // GLB bbox Y: -0.96 to 0.95. At scale 1.8, bottom = -1.73. Offset +1.75 puts base at ground.
  return (
    <group position={[position[0], position[1] + scale * 0.96, position[2]]} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}
useGLTF.preload("/models/street-lamp.glb");

/* ================================================================== */
/*  STREET TREE                                                        */
/* ================================================================== */
function StreetTree({ position, color = "#3a5a30" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.05, 0.09, 1.6, 6]} /><meshStandardMaterial color="#4a3020" roughness={0.9} /></mesh>
      <mesh position={[0, 2.0, 0]}><sphereGeometry args={[0.8, 8, 6]} /><meshStandardMaterial color={color} roughness={0.85} envMapIntensity={0.4} /></mesh>
      <mesh position={[0.2, 2.3, 0.1]}><sphereGeometry args={[0.55, 7, 5]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
      <mesh position={[-0.15, 2.4, -0.1]}><sphereGeometry args={[0.45, 6, 5]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    </group>
  );
}

/* ================================================================== */
/*  KC PLAZA BACKDROP (procedural — Spanish-inspired architecture)     */
/* ================================================================== */
function KCPlaza({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ── Center: Giralda Tower (KC Plaza's iconic replica) ── */}
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[3, 16, 3]} />
        <meshStandardMaterial color="#c8a878" roughness={0.45} metalness={0.15} emissive="#4a3820" emissiveIntensity={0.12} envMapIntensity={1.5} />
      </mesh>
      {/* Tower decorative bands */}
      {[4, 8, 12].map((y) => (
        <mesh key={`tband-${y}`} position={[0, y, 1.55]}>
          <boxGeometry args={[3.2, 0.3, 0.1]} />
          <meshStandardMaterial color="#d4b888" roughness={0.4} metalness={0.2} emissive="#5a4828" emissiveIntensity={0.1} />
        </mesh>
      ))}
      {/* Tower arched windows */}
      {[5, 7, 9, 11, 13].map((y) => (
        <group key={`twin-${y}`}>
          <mesh position={[0, y, 1.55]}>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial color="#2a2018" roughness={0.5} />
          </mesh>
          <mesh position={[0, y + 0.8, 1.55]}>
            <circleGeometry args={[0.5, 10, 0, Math.PI]} />
            <meshStandardMaterial color="#2a2018" roughness={0.5} />
          </mesh>
          {/* Warm glow from inside */}
          <mesh position={[0, y, 1.56]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color="#ffcc88" emissive="#ffaa44" emissiveIntensity={0.4} transparent opacity={0.15} />
          </mesh>
        </group>
      ))}
      {/* Tower top — ornate cap with cupola */}
      <mesh position={[0, 16.5, 0]}>
        <boxGeometry args={[3.4, 0.5, 3.4]} />
        <meshStandardMaterial color="#d4b888" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 17.5, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 1.5, 8]} />
        <meshStandardMaterial color="#c8a878" roughness={0.4} metalness={0.15} emissive="#4a3820" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 18.8, 0]}>
        <sphereGeometry args={[0.8, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b89868" roughness={0.35} metalness={0.2} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, 19.5, 0]}>
        <cylinderGeometry args={[0.02, 0.15, 1, 4]} />
        <meshStandardMaterial color="#c0a070" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* ── Left wing — Spanish storefront ── */}
      <mesh position={[-8, 4, 0]}>
        <boxGeometry args={[12, 8, 2]} />
        <meshStandardMaterial color="#c0a070" roughness={0.5} metalness={0.12} emissive="#3a2818" emissiveIntensity={0.1} envMapIntensity={1.2} />
      </mesh>
      {/* Left wing decorative cornice */}
      <mesh position={[-8, 8.2, 0]}>
        <boxGeometry args={[12.5, 0.4, 2.3]} />
        <meshStandardMaterial color="#d4b888" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Left wing arched windows */}
      {[-12, -10, -8, -6, -4].map((x) => (
        <group key={`lw-${x}`}>
          <mesh position={[x, 5.5, 1.05]}>
            <planeGeometry args={[1.2, 2.5]} />
            <meshStandardMaterial color="#2a2018" roughness={0.5} />
          </mesh>
          <mesh position={[x, 6.9, 1.05]}>
            <circleGeometry args={[0.6, 10, 0, Math.PI]} />
            <meshStandardMaterial color="#2a2018" roughness={0.5} />
          </mesh>
          <mesh position={[x, 5.5, 1.06]}>
            <planeGeometry args={[1, 2.2]} />
            <meshStandardMaterial color="#ffcc88" emissive="#ffaa44" emissiveIntensity={0.3} transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
      {/* Left ground-floor shops — warm storefronts */}
      {[-12, -10, -8, -6, -4].map((x) => (
        <mesh key={`lshop-${x}`} position={[x, 1.5, 1.05]}>
          <planeGeometry args={[1.4, 2.5]} />
          <meshStandardMaterial color="#ffddaa" emissive="#ffaa55" emissiveIntensity={0.5} transparent opacity={0.2} />
        </mesh>
      ))}

      {/* ── Right wing — Spanish storefront ── */}
      <mesh position={[8, 4, 0]}>
        <boxGeometry args={[12, 8, 2]} />
        <meshStandardMaterial color="#b89060" roughness={0.5} metalness={0.12} emissive="#3a2818" emissiveIntensity={0.1} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[8, 8.2, 0]}>
        <boxGeometry args={[12.5, 0.4, 2.3]} />
        <meshStandardMaterial color="#d4b888" roughness={0.4} metalness={0.15} />
      </mesh>
      {[4, 6, 8, 10, 12].map((x) => (
        <group key={`rw-${x}`}>
          <mesh position={[x, 5.5, 1.05]}>
            <planeGeometry args={[1.2, 2.5]} />
            <meshStandardMaterial color="#2a2018" roughness={0.5} />
          </mesh>
          <mesh position={[x, 6.9, 1.05]}>
            <circleGeometry args={[0.6, 10, 0, Math.PI]} />
            <meshStandardMaterial color="#2a2018" roughness={0.5} />
          </mesh>
          <mesh position={[x, 5.5, 1.06]}>
            <planeGeometry args={[1, 2.2]} />
            <meshStandardMaterial color="#ffcc88" emissive="#ffaa44" emissiveIntensity={0.3} transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
      {[4, 6, 8, 10, 12].map((x) => (
        <mesh key={`rshop-${x}`} position={[x, 1.5, 1.05]}>
          <planeGeometry args={[1.4, 2.5]} />
          <meshStandardMaterial color="#ffddaa" emissive="#ffaa55" emissiveIntensity={0.5} transparent opacity={0.2} />
        </mesh>
      ))}

      {/* ── Small secondary tower on right ── */}
      <mesh position={[14.5, 6, 0]}>
        <boxGeometry args={[2, 12, 2]} />
        <meshStandardMaterial color="#c0a070" roughness={0.45} metalness={0.15} emissive="#3a2818" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[14.5, 12.3, 0]}>
        <cylinderGeometry args={[0.6, 1, 1.2, 6]} />
        <meshStandardMaterial color="#b89060" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* ── Plaza fountain (center foreground) ── */}
      <group position={[0, 0, 4]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[1.2, 1.4, 0.6, 12]} />
          <meshStandardMaterial color="#8a8580" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 6]} />
          <meshStandardMaterial color="#8a8580" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.15, 8]} />
          <meshStandardMaterial color="#8a8580" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Water glow */}
        <mesh position={[0, 0.35, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[1.1, 12]} />
          <meshStandardMaterial color="#4488aa" emissive="#336688" emissiveIntensity={0.3} transparent opacity={0.25} />
        </mesh>
      </group>

      {/* ── Warm uplighting ── */}
      <pointLight position={[0, 2, 5]} intensity={4} color="#ffddaa" distance={20} decay={1.5} />
      <pointLight position={[-8, 2, 5]} intensity={2.5} color="#ffddaa" distance={16} decay={1.5} />
      <pointLight position={[8, 2, 5]} intensity={2.5} color="#ffddaa" distance={16} decay={1.5} />
      <pointLight position={[0, 12, 3]} intensity={2} color="#ffeedd" distance={18} decay={2} />
    </group>
  );
}

/* ================================================================== */
/*  KC STREETCAR (procedural)                                          */
/* ================================================================== */
function KCStreetcar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main body — red lower / silver upper */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[2.4, 1.6, 8]} />
        <meshStandardMaterial color="#c0282e" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Silver upper band */}
      <mesh position={[0, 2.15, 0]}>
        <boxGeometry args={[2.45, 0.5, 8.05]} />
        <meshStandardMaterial color="#d0d0d5" roughness={0.2} metalness={0.5} envMapIntensity={1.2} />
      </mesh>
      {/* Roof — rounded top */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[2.2, 0.3, 7.8]} />
        <meshStandardMaterial color="#e0e0e5" roughness={0.15} metalness={0.4} />
      </mesh>
      {/* Windows — right side (facing the platform) */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`sw-r-${i}`} position={[1.22, 1.6, -3 + i * 1.1]}>
          <planeGeometry args={[0.02, 0.9]} />
          <meshStandardMaterial color="#aaddff" emissive="#88bbdd" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Window glow strip — right side */}
      <mesh position={[1.22, 1.6, 0]}>
        <planeGeometry args={[0.02, 0.8, 1, 1]} />
        <meshStandardMaterial color="#ffeecc" emissive="#ffcc88" emissiveIntensity={0.4} transparent opacity={0.4} />
      </mesh>
      {/* Windows — left side */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`sw-l-${i}`} position={[-1.22, 1.6, -3 + i * 1.1]}>
          <planeGeometry args={[0.02, 0.9]} />
          <meshStandardMaterial color="#aaddff" emissive="#88bbdd" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Front destination sign */}
      <mesh position={[0, 2.05, 4.03]}>
        <planeGeometry args={[1.4, 0.3]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.05, 4.04]}>
        <planeGeometry args={[1.2, 0.2]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffaa22" emissiveIntensity={2} />
      </mesh>
      {/* Headlights */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={`hl-${x}`} position={[x, 1.0, 4.02]}>
          <circleGeometry args={[0.12, 8]} />
          <meshStandardMaterial color="#ffffee" emissive="#ffeecc" emissiveIntensity={3} />
        </mesh>
      ))}
      {/* Wheels / undercarriage */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.6, 0.3, 8.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ================================================================== */
/*  STREETCAR STOP PLATFORM                                            */
/* ================================================================== */
function StreetcarPlatform({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Raised concrete platform */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[3, 0.3, 6]} />
        <meshStandardMaterial color="#8a8580" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Yellow safety edge */}
      <mesh position={[-1.48, 0.31, 0]}>
        <boxGeometry args={[0.08, 0.02, 6]} />
        <meshStandardMaterial color="#ddcc44" emissive="#bbaa22" emissiveIntensity={0.5} roughness={0.5} />
      </mesh>

      {/* Glass canopy — metal frame + glass panels */}
      {/* Vertical posts */}
      {[-2.5, 2.5].map((dz) => (
        <group key={`post-${dz}`}>
          <mesh position={[-0.5, 1.8, dz]}>
            <cylinderGeometry args={[0.04, 0.04, 3.3, 6]} />
            <meshStandardMaterial color="#606060" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[1.2, 1.8, dz]}>
            <cylinderGeometry args={[0.04, 0.04, 3.3, 6]} />
            <meshStandardMaterial color="#606060" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Canopy roof — frosted glass */}
      <mesh position={[0.35, 3.5, 0]} rotation-z={0.08}>
        <boxGeometry args={[2.2, 0.06, 5.5]} />
        <meshStandardMaterial color="#aabbcc" roughness={0.1} metalness={0.3} transparent opacity={0.35} envMapIntensity={2} />
      </mesh>
      {/* Cross beams */}
      {[-2, 0, 2].map((dz) => (
        <mesh key={`beam-${dz}`} position={[0.35, 3.48, dz]}>
          <boxGeometry args={[2.2, 0.05, 0.06]} />
          <meshStandardMaterial color="#505050" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Bench */}
      <mesh position={[0.5, 0.55, 0]}>
        <boxGeometry args={[0.6, 0.06, 1.8]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Bench legs */}
      {[-0.7, 0, 0.7].map((dz) => (
        <mesh key={`bl-${dz}`} position={[0.5, 0.38, dz]}>
          <boxGeometry args={[0.04, 0.45, 0.04]} />
          <meshStandardMaterial color="#404040" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Under-canopy warm light */}
      <pointLight position={[0.3, 3.2, 0]} intensity={0.8} color="#ffddaa" distance={6} decay={2} />
    </group>
  );
}

/* ================================================================== */
/*  STREETCAR RAIL TRACKS                                              */
/* ================================================================== */
function RailTracks({ z, length }: { z: number; length: number }) {
  return (
    <group>
      {/* Double tracks — left and right of center */}
      {[-2.2, -1.0, 1.0, 2.2].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 0.01, z]}>
          <boxGeometry args={[0.06, 0.04, length]} />
          <meshStandardMaterial color="#888890" roughness={0.2} metalness={0.7} envMapIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ================================================================== */
/*  UNION STATION — Procedural Beaux-Arts facade                       */
/*  KC Union Station: grand limestone, three arched entries,           */
/*  iconic clock, symmetrical wings, barrel vault roof behind          */
/* ================================================================== */

/* Shared materials */
const LIMESTONE = { color: "#d4c8b0", roughness: 0.75, metalness: 0.02 };
const LIMESTONE_DARK = { color: "#b8a890", roughness: 0.8, metalness: 0.03 };
const LIMESTONE_ACCENT = { color: "#c8bca4", roughness: 0.7, metalness: 0.02 };
const ROOF_METAL = { color: "#4a5a55", roughness: 0.5, metalness: 0.4 };
const WINDOW_GLASS = { color: "#1a2535", roughness: 0.1, metalness: 0.8 };

/* Arched window/door — semicircle top + rectangular bottom */
function ArchOpening({ width, height, depth, glowing }: {
  width: number; height: number; depth: number; glowing?: boolean;
}) {
  const archRadius = width / 2;
  const rectHeight = height - archRadius;
  return (
    <group>
      {/* Rectangular lower portion */}
      <mesh position={[0, rectHeight / 2, 0]}>
        <boxGeometry args={[width, rectHeight, depth]} />
        <meshStandardMaterial {...WINDOW_GLASS} />
      </mesh>
      {/* Semicircular arch top */}
      <mesh position={[0, rectHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[archRadius, archRadius, depth, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...WINDOW_GLASS} />
      </mesh>
      {/* Warm interior glow */}
      {glowing && (
        <>
          <mesh position={[0, rectHeight / 2, depth / 2 + 0.01]}>
            <planeGeometry args={[width * 0.85, rectHeight * 0.85]} />
            <meshBasicMaterial color="#ffddaa" transparent opacity={0.12} />
          </mesh>
          <pointLight
            position={[0, rectHeight * 0.6, depth]}
            intensity={2}
            color="#ffeedd"
            distance={4}
            decay={2}
          />
        </>
      )}
      {/* Arch surround / voussoirs */}
      <mesh position={[0, rectHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[archRadius + 0.04, 0.06, 6, 16, Math.PI]} />
        <meshStandardMaterial {...LIMESTONE_ACCENT} />
      </mesh>
    </group>
  );
}

/* Pilaster — flat column relief on the facade */
function Pilaster({ position, height }: { position: [number, number, number]; height: number }) {
  return (
    <group position={position}>
      {/* Shaft */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.15, height, 0.12]} />
        <meshStandardMaterial {...LIMESTONE_ACCENT} />
      </mesh>
      {/* Capital */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[0.25, 0.12, 0.18]} />
        <meshStandardMaterial {...LIMESTONE_ACCENT} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.22, 0.12, 0.15]} />
        <meshStandardMaterial {...LIMESTONE_DARK} />
      </mesh>
    </group>
  );
}

/* Clock face */
function StationClock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Clock housing — circular recess */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 24]} />
        <meshStandardMaterial {...LIMESTONE_DARK} />
      </mesh>
      {/* Clock face */}
      <mesh position={[0, 0, 0.07]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, 0.08]}>
            <boxGeometry args={[0.02, 0.06, 0.01]} />
            <meshStandardMaterial color="#2a2520" roughness={0.3} />
          </mesh>
        );
      })}
      {/* Hour hand — ~7:20 position */}
      <mesh position={[0.08, -0.08, 0.09]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.02, 0.22, 0.01]} />
        <meshStandardMaterial color="#1a1510" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Minute hand */}
      <mesh position={[-0.02, 0.1, 0.09]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.015, 0.3, 0.01]} />
        <meshStandardMaterial color="#1a1510" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Surround ring */}
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[0.48, 0.04, 8, 24]} />
        <meshStandardMaterial color="#8a7a60" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Subtle clock glow */}
      <pointLight position={[0, 0, 0.3]} intensity={1.5} color="#fff8e0" distance={3} decay={2} />
    </group>
  );
}

/* Decorative cornice/entablature band */
function Cornice({ y, width, depth = 0.2 }: { y: number; width: number; depth?: number }) {
  return (
    <group position={[0, y, 0]}>
      {/* Main cornice band */}
      <mesh>
        <boxGeometry args={[width, 0.12, depth + 0.1]} />
        <meshStandardMaterial {...LIMESTONE_ACCENT} />
      </mesh>
      {/* Upper molding */}
      <mesh position={[0, 0.08, 0.02]}>
        <boxGeometry args={[width + 0.05, 0.04, depth + 0.06]} />
        <meshStandardMaterial {...LIMESTONE_DARK} />
      </mesh>
      {/* Lower molding */}
      <mesh position={[0, -0.08, 0.02]}>
        <boxGeometry args={[width + 0.02, 0.03, depth + 0.04]} />
        <meshStandardMaterial {...LIMESTONE_DARK} />
      </mesh>
    </group>
  );
}

function UnionStation({ position }: { position: [number, number, number] }) {
  const isMobile = useStore((s) => s.isMobile);

  return (
    <group position={position}>
      {/* ── CENTRAL BLOCK — the grand facade ── */}
      <group>
        {/* Main facade wall */}
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[7.5, 5.6, 0.4]} />
          <meshStandardMaterial {...LIMESTONE} />
        </mesh>

        {/* Raised central pavilion — slightly forward */}
        <mesh position={[0, 3.5, 0.08]}>
          <boxGeometry args={[4.2, 4.2, 0.2]} />
          <meshStandardMaterial {...LIMESTONE_ACCENT} />
        </mesh>

        {/* ── Three grand arched entries ── */}
        {/* Center arch — tallest */}
        <group position={[0, 0.05, 0.22]}>
          <ArchOpening width={1.1} height={3.2} depth={0.3} glowing />
        </group>
        {/* Left arch */}
        <group position={[-1.5, 0.05, 0.22]}>
          <ArchOpening width={0.9} height={2.7} depth={0.3} glowing />
        </group>
        {/* Right arch */}
        <group position={[1.5, 0.05, 0.22]}>
          <ArchOpening width={0.9} height={2.7} depth={0.3} glowing />
        </group>

        {/* ── Pilasters between arches ── */}
        <Pilaster position={[-0.7, 0, 0.22]} height={3.5} />
        <Pilaster position={[0.7, 0, 0.22]} height={3.5} />
        <Pilaster position={[-2.1, 0, 0.22]} height={3.0} />
        <Pilaster position={[2.1, 0, 0.22]} height={3.0} />

        {/* ── Clock — centered above main arch ── */}
        <StationClock position={[0, 4.2, 0.25]} />

        {/* ── Upper windows — row above arches ── */}
        {[-1.5, -0.75, 0, 0.75, 1.5].map((x, i) => (
          <group key={`upper-win-${i}`} position={[x, 3.8, 0.22]}>
            <mesh>
              <boxGeometry args={[0.35, 0.55, 0.05]} />
              <meshStandardMaterial {...WINDOW_GLASS} />
            </mesh>
            {/* Window surround */}
            <mesh position={[0, 0, -0.01]}>
              <boxGeometry args={[0.42, 0.62, 0.03]} />
              <meshStandardMaterial {...LIMESTONE_DARK} />
            </mesh>
          </group>
        ))}

        {/* ── Cornices ── */}
        <Cornice y={3.4} width={7.6} />
        <Cornice y={5.55} width={4.4} depth={0.25} />

        {/* ── Parapet / balustrade at roofline ── */}
        <mesh position={[0, 5.75, 0]}>
          <boxGeometry args={[4.6, 0.25, 0.15]} />
          <meshStandardMaterial {...LIMESTONE_ACCENT} />
        </mesh>
        {/* Parapet posts */}
        {[-2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1].map((x, i) => (
          <mesh key={`parapet-${i}`} position={[x, 5.95, 0]}>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial {...LIMESTONE_DARK} />
          </mesh>
        ))}

        {/* ── Grand staircase / raised platform ── */}
        {[0, 1, 2].map((step) => (
          <mesh key={`step-${step}`} position={[0, step * 0.08, 0.5 + step * 0.2]}>
            <boxGeometry args={[6 + step * 0.5, 0.08, 0.4]} />
            <meshStandardMaterial {...LIMESTONE_DARK} />
          </mesh>
        ))}
      </group>

      {/* ── LEFT WING ── */}
      <group position={[-5.2, 0, 0.3]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[3, 4, 0.35]} />
          <meshStandardMaterial {...LIMESTONE} />
        </mesh>
        {/* Wing windows — 2 rows */}
        {[-0.8, 0, 0.8].map((x, i) => (
          <group key={`lw-lower-${i}`}>
            {/* Lower windows */}
            <group position={[x, 1.5, 0.19]}>
              <mesh>
                <boxGeometry args={[0.4, 0.8, 0.05]} />
                <meshStandardMaterial {...WINDOW_GLASS} />
              </mesh>
              <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[0.48, 0.88, 0.03]} />
                <meshStandardMaterial {...LIMESTONE_DARK} />
              </mesh>
            </group>
            {/* Upper windows */}
            <group position={[x, 2.8, 0.19]}>
              <mesh>
                <boxGeometry args={[0.35, 0.55, 0.05]} />
                <meshStandardMaterial {...WINDOW_GLASS} />
              </mesh>
              <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[0.42, 0.62, 0.03]} />
                <meshStandardMaterial {...LIMESTONE_DARK} />
              </mesh>
            </group>
          </group>
        ))}
        <Cornice y={2.2} width={3.1} />
        <Cornice y={3.95} width={3.1} />
        {/* Wing warm glow */}
        <pointLight position={[0, 1.5, 1]} intensity={1} color="#ffeedd" distance={3} decay={2} />
      </group>

      {/* ── RIGHT WING ── */}
      <group position={[5.2, 0, 0.3]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[3, 4, 0.35]} />
          <meshStandardMaterial {...LIMESTONE} />
        </mesh>
        {[-0.8, 0, 0.8].map((x, i) => (
          <group key={`rw-lower-${i}`}>
            <group position={[x, 1.5, 0.19]}>
              <mesh>
                <boxGeometry args={[0.4, 0.8, 0.05]} />
                <meshStandardMaterial {...WINDOW_GLASS} />
              </mesh>
              <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[0.48, 0.88, 0.03]} />
                <meshStandardMaterial {...LIMESTONE_DARK} />
              </mesh>
            </group>
            <group position={[x, 2.8, 0.19]}>
              <mesh>
                <boxGeometry args={[0.35, 0.55, 0.05]} />
                <meshStandardMaterial {...WINDOW_GLASS} />
              </mesh>
              <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[0.42, 0.62, 0.03]} />
                <meshStandardMaterial {...LIMESTONE_DARK} />
              </mesh>
            </group>
          </group>
        ))}
        <Cornice y={2.2} width={3.1} />
        <Cornice y={3.95} width={3.1} />
        <pointLight position={[0, 1.5, 1]} intensity={1} color="#ffeedd" distance={3} decay={2} />
      </group>

      {/* ── BARREL VAULT ROOF — visible behind the facade ── */}
      {!isMobile && (
        <group position={[0, 5.2, -1.5]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[2, 2, 5, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial {...ROOF_METAL} />
          </mesh>
        </group>
      )}

      {/* ── Facade uplighting ── */}
      <pointLight position={[0, 0.5, 2]} intensity={4} color="#ffeedd" distance={8} decay={1.5} />
      <pointLight position={[-3, 0.5, 2]} intensity={2.5} color="#ffddcc" distance={6} decay={1.5} />
      <pointLight position={[3, 0.5, 2]} intensity={2.5} color="#ffddcc" distance={6} decay={1.5} />
      {/* Dramatic top-down wash */}
      <pointLight position={[0, 7, 1]} intensity={2} color="#fff0dd" distance={10} decay={1.8} />
    </group>
  );
}

/* ================================================================== */
/*  ZONE 1: KC STREETCAR STOP (start → mainStreet, Z=8 to -10)        */
/* ================================================================== */
function StreetZone() {
  const isMobile = useStore((s) => s.isMobile);

  return (
    <group>
      {/* Rail tracks running through the wider street */}
      <RailTracks z={0} length={40} />

      {/* KC Streetcar — parked on the left */}
      <KCStreetcar position={[-2.6, 0, 4]} />

      {/* Streetcar platform on the right */}
      <StreetcarPlatform position={[2, 0, 0]} />

      {/* ── Union Station — end of boulevard, visible in gap between buildings ── */}
      <UnionStation position={[0, 0, -14]} />
      {/* Flood lighting — strong at distance */}
      <pointLight position={[0, 3, -18]} intensity={8} color="#ffddaa" distance={20} decay={1.2} />
      <pointLight position={[-6, 3, -18]} intensity={5} color="#ffcc88" distance={16} decay={1.2} />
      <pointLight position={[6, 3, -18]} intensity={5} color="#ffcc88" distance={16} decay={1.2} />
      <pointLight position={[0, 8, -16]} intensity={3} color="#ffeedd" distance={18} decay={1.5} />

      {/* ── Boulevard buildings — LEFT side (closer for mobile visibility) ── */}
      <BuildingFacade position={[-6, 0, 10]} width={3} height={5} depth={3} style="brick" windowGlow={0.5} />
      <BuildingFacade position={[-6, 0, 6]} width={3} height={6.5} depth={3} style="plaster" windowGlow={0.4} />
      <BuildingFacade position={[-6, 0, 2]} width={3} height={4.5} depth={3} style="brick" windowGlow={0.6} />
      <BuildingFacade position={[-6, 0, -2]} width={3} height={5.5} depth={3} style="plaster" windowGlow={0.3} />
      <BuildingFacade position={[-6.5, 0, -6]} width={3} height={7} depth={3} style="brick" windowGlow={0.4} />
      {!isMobile && <BuildingFacade position={[-6, 0, -10]} width={3} height={4} depth={3} style="plaster" windowGlow={0.5} />}

      {/* ── Boulevard buildings — RIGHT side ── */}
      <BuildingFacade position={[6, 0, 10]} width={3} height={4.5} depth={3} style="plaster" windowGlow={0.4} />
      <BuildingFacade position={[6, 0, 6]} width={3} height={6} depth={3} style="brick" windowGlow={0.5} />
      <BuildingFacade position={[6, 0, 2]} width={3} height={5} depth={3} style="modern" windowGlow={0.7} />
      <BuildingFacade position={[6, 0, -2]} width={3} height={5.5} depth={3} style="plaster" windowGlow={0.3} />
      <BuildingFacade position={[6.5, 0, -6]} width={3} height={6.5} depth={3} style="brick" windowGlow={0.5} />
      {!isMobile && <BuildingFacade position={[6, 0, -10]} width={3} height={4.5} depth={3} style="modern" windowGlow={0.6} />}

      {/* ── Street lamps lining the boulevard ── */}
      <RealStreetLamp position={[-4, 0, 9]} />
      <RealStreetLamp position={[4, 0, 7]} />
      <RealStreetLamp position={[-4, 0, 1]} />
      <RealStreetLamp position={[4, 0, -1]} />
      {!isMobile && (
        <>
          <RealStreetLamp position={[-4, 0, -7]} />
          <RealStreetLamp position={[4, 0, -5]} />
        </>
      )}

      {/* ── Trees along sidewalks ── */}
      <StreetTree position={[-5, 0, 4]} color="#3a5a30" />
      <StreetTree position={[5, 0, 3]} color="#4a6838" />
      <StreetTree position={[-5, 0, -4]} color="#3a5a30" />
      {!isMobile && <StreetTree position={[5, 0, -5]} color="#4a6838" />}

      {/* ── Street furniture — benches ── */}
      {[[-4, 5], [4, 3], [-4, -3]].map(([x, z], i) => (
        <group key={`bench-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.8, 0.06, 0.35]} /><meshStandardMaterial color="#5a4a3a" roughness={0.6} /></mesh>
          <mesh position={[0, 0.15, -0.15]}><boxGeometry args={[0.8, 0.3, 0.04]} /><meshStandardMaterial color="#5a4a3a" roughness={0.6} /></mesh>
          {[[-0.35, 0], [0.35, 0]].map(([lx], li) => (
            <mesh key={li} position={[lx, 0.15, 0]}><boxGeometry args={[0.04, 0.3, 0.35]} /><meshStandardMaterial color="#3a3030" roughness={0.4} metalness={0.3} /></mesh>
          ))}
        </group>
      ))}

      {/* ── Crosswalk stripes near mainStreet stop ── */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`xwalk-${i}`} rotation-x={-Math.PI / 2} position={[-2.5 + i * 1, 0.02, -7]}>
          <planeGeometry args={[0.4, 1.8]} />
          <meshStandardMaterial color="#f0e8d0" roughness={0.7} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ================================================================== */
/*  ZONE 2: RESTAURANT INTERIOR (dinner, Z=-24)                       */
/* ================================================================== */
function RestaurantZone() {
  const z = -36;
  return (
    <group position={[0, 0, z]}>
      {/* Warm floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -6]}>
        <boxGeometry args={[12, 6, 0.3]} />
        <meshStandardMaterial color="#5a3828" roughness={0.7} envMapIntensity={0.3} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-6, 3, 0]}>
        <boxGeometry args={[0.3, 6, 14]} />
        <meshStandardMaterial color="#5a3828" roughness={0.7} envMapIntensity={0.3} />
      </mesh>
      <mesh position={[6, 3, 0]}>
        <boxGeometry args={[0.3, 6, 14]} />
        <meshStandardMaterial color="#5a3828" roughness={0.7} envMapIntensity={0.3} />
      </mesh>

      {/* Ceiling — warm dark wood */}
      <mesh rotation-x={Math.PI / 2} position={[0, 5.5, 0]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.8} />
      </mesh>

      {/* ── Dining tables with candles ── */}
      {[[-2, -1], [2, -1], [-2, -4], [2, -4], [0, 2]].map(([x, dz], i) => (
        <group key={`table-${i}`} position={[x, 0, dz]}>
          {/* Table */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.04, 12]} />
            <meshStandardMaterial color="#f8f0e8" roughness={0.3} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.7, 6]} />
            <meshStandardMaterial color="#2a2018" metalness={0.4} roughness={0.3} />
          </mesh>
          {/* Candle glow */}
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#ffddaa" emissive="#ffaa44" emissiveIntensity={4} />
          </mesh>
          {/* Warm light pool on table */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.72, 0]}>
            <circleGeometry args={[0.35, 12]} />
            <meshStandardMaterial color="#ffcc88" emissive="#ffaa44" emissiveIntensity={0.3} transparent opacity={0.2} />
          </mesh>
          {/* Chairs */}
          {[[-0.55, 0], [0.55, 0], [0, -0.55], [0, 0.55]].map(([cx, cz], ci) => (
            <mesh key={ci} position={[cx, 0.4, cz]}>
              <boxGeometry args={[0.25, 0.04, 0.25]} />
              <meshStandardMaterial color="#6a4030" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Wine bar / back bar ── */}
      <mesh position={[0, 1.2, -5.7]}>
        <boxGeometry args={[6, 2.4, 0.4]} />
        <meshStandardMaterial color="#3a2218" roughness={0.5} metalness={0.1} envMapIntensity={0.5} />
      </mesh>
      {/* Shelves with warm glow */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={`bottle-${i}`} position={[x, 2.6, -5.65]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#4a1a10" : "#1a3a1a"} roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
      {/* Mirror behind bar — reflective */}
      <mesh position={[0, 3.5, -5.65]}>
        <planeGeometry args={[5, 2]} />
        <meshStandardMaterial color="#bbb8b0" roughness={0.05} metalness={0.8} envMapIntensity={2} />
      </mesh>

      {/* ── Chandeliers ── */}
      {[[-2, 0], [2, 0], [0, -3]].map(([x, dz], i) => (
        <group key={`chand-${i}`} position={[x, 4.8, dz]}>
          <mesh><sphereGeometry args={[0.15, 8, 8]} /><meshStandardMaterial color="#ffeecc" emissive="#ffcc66" emissiveIntensity={3} /></mesh>
          {/* Ring */}
          <mesh><torusGeometry args={[0.25, 0.02, 6, 12]} /><meshStandardMaterial color="#8a7040" metalness={0.6} roughness={0.3} /></mesh>
          {/* Chain */}
          <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.008, 0.008, 0.8, 4]} /><meshStandardMaterial color="#8a7040" metalness={0.5} /></mesh>
        </group>
      ))}

      {/* ── Warm point light (only on desktop) ── */}
      <pointLight position={[0, 4, 0]} intensity={2} color="#ffbb77" distance={12} decay={2} />
    </group>
  );
}

/* ================================================================== */
/*  ZONE 3: SPEAKEASY / JAZZ CLUB (activity, Z=-46)                   */
/* ================================================================== */
function JazzBandModel({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF("/models/jazz-band.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <group position={position} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}
useGLTF.preload("/models/jazz-band.glb");

function SpeakeasyZone() {
  const isMobile = useStore((s) => s.isMobile);
  const z = -66;
  return (
    <group position={[0, 0, z]}>
      {/* Dark polished floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#1a1215" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Walls — dark moody brick */}
      <mesh position={[0, 3.5, -6]}>
        <boxGeometry args={[14, 7, 0.3]} />
        <meshStandardMaterial color="#2a1a18" roughness={0.85} />
      </mesh>
      <mesh position={[-7, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 14]} />
        <meshStandardMaterial color="#2a1a18" roughness={0.85} />
      </mesh>
      <mesh position={[7, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 14]} />
        <meshStandardMaterial color="#2a1a18" roughness={0.85} />
      </mesh>

      {/* Low ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, 6, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#150e0e" roughness={0.9} />
      </mesh>

      {/* ── Stage area at the back ── */}
      <mesh position={[0, 0.25, -4.5]}>
        <boxGeometry args={[7, 0.5, 3.5]} />
        <meshStandardMaterial color="#3a2820" roughness={0.6} />
      </mesh>
      {/* Stage front edge — gold trim */}
      <mesh position={[0, 0.5, -2.8]}>
        <boxGeometry args={[7, 0.06, 0.05]} />
        <meshStandardMaterial color="#c8a050" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Stage spotlight pools — warm amber */}
      <mesh position={[-1.2, 0.55, -4.2]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial color="#ffaa44" emissive="#ff8822" emissiveIntensity={0.8} transparent opacity={0.2} />
      </mesh>
      <mesh position={[1.2, 0.55, -4.8]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial color="#ffaa44" emissive="#ff8822" emissiveIntensity={0.8} transparent opacity={0.2} />
      </mesh>

      {/* ── Jazz band on stage ── */}
      {!isMobile ? (
        <JazzBandModel position={[0, 0.5, -4.5]} scale={1.2} />
      ) : (
        /* Visible band silhouettes on mobile with instruments */
        <>
          {/* Pianist — left */}
          <group position={[-2, 0.5, -4.8]}>
            {/* Body */}
            <mesh position={[0, 0.7, 0]}><capsuleGeometry args={[0.15, 0.5, 4, 8]} /><meshStandardMaterial color="#2a2035" roughness={0.7} /></mesh>
            <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.14, 6, 6]} /><meshStandardMaterial color="#3a2a25" roughness={0.6} /></mesh>
            {/* Piano body */}
            <mesh position={[0.1, 0.4, -0.3]}><boxGeometry args={[0.8, 0.4, 0.5]} /><meshStandardMaterial color="#0a0808" roughness={0.2} metalness={0.3} /></mesh>
            {/* Piano keys */}
            <mesh position={[0.1, 0.62, -0.15]}><boxGeometry args={[0.7, 0.04, 0.15]} /><meshStandardMaterial color="#f0e8d8" emissive="#f0e8d8" emissiveIntensity={0.2} /></mesh>
          </group>

          {/* Saxophonist — center left */}
          <group position={[-0.5, 0.5, -5]}>
            <mesh position={[0, 0.8, 0]}><capsuleGeometry args={[0.14, 0.55, 4, 8]} /><meshStandardMaterial color="#2a2035" roughness={0.7} /></mesh>
            <mesh position={[0, 1.3, 0]}><sphereGeometry args={[0.13, 6, 6]} /><meshStandardMaterial color="#3a2a25" roughness={0.6} /></mesh>
            {/* Saxophone — curved brass */}
            <mesh position={[0.15, 0.9, -0.1]} rotation={[0.3, 0, -0.4]}><cylinderGeometry args={[0.03, 0.06, 0.5, 6]} /><meshStandardMaterial color="#c8a030" roughness={0.2} metalness={0.7} /></mesh>
            <mesh position={[0.22, 0.65, -0.15]}><sphereGeometry args={[0.07, 6, 6]} /><meshStandardMaterial color="#c8a030" roughness={0.2} metalness={0.7} /></mesh>
          </group>

          {/* Singer — center, standing tall */}
          <group position={[0.8, 0.5, -4.2]}>
            <mesh position={[0, 0.85, 0]}><capsuleGeometry args={[0.15, 0.65, 4, 8]} /><meshStandardMaterial color="#4a1828" roughness={0.5} /></mesh>
            <mesh position={[0, 1.45, 0]}><sphereGeometry args={[0.14, 6, 6]} /><meshStandardMaterial color="#3a2a25" roughness={0.6} /></mesh>
            {/* Mic stand */}
            <mesh position={[0.12, 0.9, -0.15]}><cylinderGeometry args={[0.012, 0.012, 1.0, 4]} /><meshStandardMaterial color="#888888" roughness={0.3} metalness={0.6} /></mesh>
            <mesh position={[0.12, 1.4, -0.15]}><sphereGeometry args={[0.035, 4, 4]} /><meshStandardMaterial color="#555555" roughness={0.3} metalness={0.5} /></mesh>
          </group>

          {/* Bassist — right */}
          <group position={[2.2, 0.5, -4.8]}>
            <mesh position={[0, 0.8, 0]}><capsuleGeometry args={[0.15, 0.55, 4, 8]} /><meshStandardMaterial color="#2a2035" roughness={0.7} /></mesh>
            <mesh position={[0, 1.3, 0]}><sphereGeometry args={[0.13, 6, 6]} /><meshStandardMaterial color="#3a2a25" roughness={0.6} /></mesh>
            {/* Upright bass */}
            <mesh position={[-0.15, 0.6, -0.05]}><capsuleGeometry args={[0.12, 0.7, 4, 8]} /><meshStandardMaterial color="#4a2810" roughness={0.4} metalness={0.1} /></mesh>
            <mesh position={[-0.15, 1.15, -0.05]}><cylinderGeometry args={[0.015, 0.015, 0.5, 4]} /><meshStandardMaterial color="#2a1808" roughness={0.5} /></mesh>
          </group>
        </>
      )}

      {/* ── Bar along left wall ── */}
      <mesh position={[-5.5, 0.6, 0]}>
        <boxGeometry args={[2, 1.2, 8]} />
        <meshStandardMaterial color="#2a1a12" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Bar top — polished */}
      <mesh position={[-5.5, 1.22, 0]}>
        <boxGeometry args={[2.1, 0.06, 8.1]} />
        <meshStandardMaterial color="#1a1010" roughness={0.1} metalness={0.4} envMapIntensity={1.5} />
      </mesh>
      {/* Bottles on bar shelf */}
      {[-3, -1.5, 0, 1.5, 3].map((bz, i) => (
        <mesh key={`bottle-${i}`} position={[-6.2, 1.5 + i * 0.05, bz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 4]} />
          <meshStandardMaterial color={["#884422", "#228844", "#442288", "#aa6622", "#226688"][i]} roughness={0.1} metalness={0.3} />
        </mesh>
      ))}
      {/* Bar mirror / shelf glow */}
      <mesh position={[-6.5, 2.0, 0]}>
        <planeGeometry args={[0.1, 1.2]} />
        <meshStandardMaterial color="#ffcc88" emissive="#ffaa44" emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>

      {/* ── Lounge seating ── */}
      {[[-2, 2], [2, 2], [-2, 4], [2, 4]].map(([x, dz], i) => (
        <group key={`lounge-${i}`} position={[x, 0, dz]}>
          <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.8, 0.25, 0.8]} /><meshStandardMaterial color="#4a1a1a" roughness={0.6} /></mesh>
          {/* Small table with candle */}
          <mesh position={[0.5, 0.45, 0]}><cylinderGeometry args={[0.2, 0.2, 0.03, 8]} /><meshStandardMaterial color="#1a1010" roughness={0.2} metalness={0.3} /></mesh>
          <mesh position={[0.5, 0.55, 0]}><sphereGeometry args={[0.025, 4, 4]} /><meshStandardMaterial color="#ffddaa" emissive="#ffaa44" emissiveIntensity={4} /></mesh>
        </group>
      ))}

      {/* ── Moody lighting — multiple spots on band ── */}
      <pointLight position={[-1, 4.5, -4.5]} intensity={2.0} color="#ff8844" distance={8} decay={2} />
      <pointLight position={[1, 4.5, -4.5]} intensity={2.0} color="#ffaa66" distance={8} decay={2} />
      <pointLight position={[0, 3, -4]} intensity={1.2} color="#ff6644" distance={6} decay={2} />
      <pointLight position={[-4, 3, 0]} intensity={0.6} color="#ff6644" distance={8} decay={2} />
      {/* Neon accent on back wall — LIVE JAZZ */}
      <mesh position={[0, 4.8, -5.8]}>
        <planeGeometry args={[3.5, 0.3]} />
        <meshStandardMaterial color="#ff4466" emissive="#ff2244" emissiveIntensity={4} />
      </mesh>
      {/* Secondary neon underline */}
      <mesh position={[0, 4.4, -5.8]}>
        <planeGeometry args={[2.5, 0.05]} />
        <meshStandardMaterial color="#ff6688" emissive="#ff4466" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/* ================================================================== */
/*  ZONE 4: ROOFTOP (drinks + reveal, Z=-66 to -80)                   */
/* ================================================================== */
function RooftopZone() {
  const z = -104;
  return (
    <group position={[0, 0, z]}>
      {/* ── Building structure below the rooftop ── */}
      {/* Front face of building — visible below railing */}
      <mesh position={[0, -4, -10]}>
        <boxGeometry args={[16, 8, 0.4]} />
        <meshStandardMaterial color="#3a3540" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Side faces of building */}
      <mesh position={[-7.8, -4, -2]}>
        <boxGeometry args={[0.4, 8, 18]} />
        <meshStandardMaterial color="#3a3540" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[7.8, -4, -2]}>
        <boxGeometry args={[0.4, 8, 18]} />
        <meshStandardMaterial color="#3a3540" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Building windows below */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={`bldg-w-${i}`}>
          <mesh position={[-5 + i * 2, -3, -9.75]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color="#ffcc88" emissive="#ff9944" emissiveIntensity={0.3} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── Rooftop deck floor — warm wood planks ── */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -2]}>
        <planeGeometry args={[15, 20]} />
        <meshStandardMaterial color="#4a4038" roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Wood plank lines */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`plank-${i}`} rotation-x={-Math.PI / 2} position={[-6 + i * 1.1, 0.015, -2]}>
          <planeGeometry args={[0.02, 20]} />
          <meshStandardMaterial color="#3a3028" roughness={0.8} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* ── Parapet / knee wall ── */}
      {/* Front parapet */}
      <mesh position={[0, 0.45, -10.5]}>
        <boxGeometry args={[15.5, 0.9, 0.5]} />
        <meshStandardMaterial color="#5a5550" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Parapet cap — concrete ledge */}
      <mesh position={[0, 0.92, -10.5]}>
        <boxGeometry args={[15.8, 0.08, 0.65]} />
        <meshStandardMaterial color="#6a6560" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Side parapets */}
      <mesh position={[-7.5, 0.45, -2]}>
        <boxGeometry args={[0.5, 0.9, 18]} />
        <meshStandardMaterial color="#5a5550" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[7.5, 0.45, -2]}>
        <boxGeometry args={[0.5, 0.9, 18]} />
        <meshStandardMaterial color="#5a5550" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Side parapet caps */}
      <mesh position={[-7.5, 0.92, -2]}>
        <boxGeometry args={[0.65, 0.08, 18.2]} />
        <meshStandardMaterial color="#6a6560" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[7.5, 0.92, -2]}>
        <boxGeometry args={[0.65, 0.08, 18.2]} />
        <meshStandardMaterial color="#6a6560" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Metal railing posts on parapet */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`post-f-${i}`}>
          <mesh position={[-6 + i * 1.7, 1.25, -10.5]}>
            <cylinderGeometry args={[0.025, 0.025, 0.7, 4]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* Horizontal railing bar — front */}
      <mesh position={[0, 1.55, -10.5]}>
        <boxGeometry args={[14.5, 0.035, 0.035]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Glass railing panels — front */}
      <mesh position={[0, 1.25, -10.48]}>
        <planeGeometry args={[14, 0.55]} />
        <meshStandardMaterial color="#88aacc" roughness={0.05} metalness={0.4} transparent opacity={0.15} envMapIntensity={2} />
      </mesh>

      {/* ── Overhead pergola structure ── */}
      {/* Main beams — running front to back */}
      {[-3, 3].map((x) => (
        <group key={`pergola-${x}`}>
          {/* Vertical posts */}
          <mesh position={[x, 1.8, -3]}>
            <boxGeometry args={[0.12, 3.6, 0.12]} />
            <meshStandardMaterial color="#3a3028" roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh position={[x, 1.8, -8]}>
            <boxGeometry args={[0.12, 3.6, 0.12]} />
            <meshStandardMaterial color="#3a3028" roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Horizontal beam */}
          <mesh position={[x, 3.6, -5.5]}>
            <boxGeometry args={[0.14, 0.14, 6]} />
            <meshStandardMaterial color="#3a3028" roughness={0.6} metalness={0.1} />
          </mesh>
        </group>
      ))}
      {/* Cross slats */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={`slat-${i}`} position={[0, 3.65, -3.5 - i * 0.8]}>
          <boxGeometry args={[6.5, 0.06, 0.1]} />
          <meshStandardMaterial color="#3a3028" roughness={0.7} metalness={0.05} />
        </mesh>
      ))}

      {/* ── String lights on pergola ── */}
      {Array.from({ length: 18 }, (_, i) => {
        const t = i / 17;
        const lx = -2.8 + Math.sin(t * Math.PI * 3) * 2.5;
        const lz = -3.2 - t * 5.5;
        const ly = 3.4 + Math.sin(t * Math.PI * 4) * 0.12;
        return (
          <group key={`slight-${i}`}>
            <mesh position={[lx, ly, lz]}>
              <sphereGeometry args={[0.04, 4, 4]} />
              <meshStandardMaterial color="#ffeecc" emissive="#ffcc66" emissiveIntensity={4} />
            </mesh>
            {/* Tiny warm glow */}
            <pointLight position={[lx, ly, lz]} intensity={0.15} color="#ffcc66" distance={1.5} decay={2} />
          </group>
        );
      })}

      {/* ── Planters with greenery along parapet ── */}
      {[[-5.5, -9], [-2, -9], [2, -9], [5.5, -9]].map(([px, pz], i) => (
        <group key={`planter-${i}`} position={[px, 0, pz]}>
          {/* Planter box */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.2, 0.8, 0.8]} />
            <meshStandardMaterial color="#5a5048" roughness={0.7} metalness={0.05} />
          </mesh>
          {/* Greenery */}
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.5, 6, 5]} />
            <meshStandardMaterial color="#2a4a22" roughness={0.85} />
          </mesh>
          <mesh position={[0.15, 1.2, 0.1]}>
            <sphereGeometry args={[0.35, 5, 4]} />
            <meshStandardMaterial color="#365a2a" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* ── Fire pit — center lounge area ── */}
      <group position={[0, 0, -5.5]}>
        {/* Fire pit base */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 0.5, 12]} />
          <meshStandardMaterial color="#4a4540" roughness={0.6} metalness={0.15} />
        </mesh>
        {/* Inner dark */}
        <mesh position={[0, 0.52, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.5, 12]} />
          <meshStandardMaterial color="#1a1210" roughness={0.9} />
        </mesh>
        {/* Fire glow */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#ff8844" emissive="#ff6622" emissiveIntensity={4} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.08, 0.7, 0.05]}>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshStandardMaterial color="#ffaa44" emissive="#ff8822" emissiveIntensity={5} transparent opacity={0.5} />
        </mesh>
        {/* Fire pit light */}
        <pointLight position={[0, 1, 0]} intensity={1.5} color="#ff8844" distance={5} decay={2} />
      </group>

      {/* ── Lounge seating around fire pit ── */}
      {/* L-shaped sofa */}
      <group position={[-2, 0, -5.5]}>
        {/* Seat */}
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[1.4, 0.35, 0.7]} /><meshStandardMaterial color="#3a3535" roughness={0.55} /></mesh>
        {/* Back */}
        <mesh position={[0, 0.6, -0.35]}><boxGeometry args={[1.4, 0.3, 0.08]} /><meshStandardMaterial color="#3a3535" roughness={0.55} /></mesh>
        {/* Cushions */}
        <mesh position={[-0.3, 0.5, 0]}><boxGeometry args={[0.55, 0.08, 0.55]} /><meshStandardMaterial color="#4a3535" roughness={0.6} /></mesh>
        <mesh position={[0.3, 0.5, 0]}><boxGeometry args={[0.55, 0.08, 0.55]} /><meshStandardMaterial color="#4a3535" roughness={0.6} /></mesh>
      </group>
      <group position={[2, 0, -5.5]}>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[1.4, 0.35, 0.7]} /><meshStandardMaterial color="#3a3535" roughness={0.55} /></mesh>
        <mesh position={[0, 0.6, -0.35]}><boxGeometry args={[1.4, 0.3, 0.08]} /><meshStandardMaterial color="#3a3535" roughness={0.55} /></mesh>
        <mesh position={[-0.3, 0.5, 0]}><boxGeometry args={[0.55, 0.08, 0.55]} /><meshStandardMaterial color="#4a3535" roughness={0.6} /></mesh>
        <mesh position={[0.3, 0.5, 0]}><boxGeometry args={[0.55, 0.08, 0.55]} /><meshStandardMaterial color="#4a3535" roughness={0.6} /></mesh>
      </group>

      {/* ── Bar counter on the right side ── */}
      <group position={[5.5, 0, -5]}>
        {/* Bar body */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.5, 1.2, 4]} />
          <meshStandardMaterial color="#2a2220" roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Bar top — polished */}
        <mesh position={[0, 1.22, 0]}>
          <boxGeometry args={[1.6, 0.06, 4.1]} />
          <meshStandardMaterial color="#1a1412" roughness={0.1} metalness={0.4} envMapIntensity={1.5} />
        </mesh>
        {/* Bar stools */}
        {[-1.2, 0, 1.2].map((sz, i) => (
          <group key={`stool-${i}`} position={[-1.2, 0, sz]}>
            <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.15, 0.15, 0.03, 8]} /><meshStandardMaterial color="#2a2525" roughness={0.4} metalness={0.3} /></mesh>
            <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.025, 0.03, 0.44, 4]} /><meshStandardMaterial color="#4a4a4a" roughness={0.3} metalness={0.6} /></mesh>
          </group>
        ))}
      </group>

      {/* ── Stairwell access structure ── */}
      <mesh position={[-5.5, 1.3, 4]}>
        <boxGeometry args={[2.5, 2.6, 2.5]} />
        <meshStandardMaterial color="#4a4540" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Door */}
      <mesh position={[-4.24, 0.9, 4]}>
        <planeGeometry args={[0.8, 1.8]} />
        <meshStandardMaterial color="#2a2520" roughness={0.5} />
      </mesh>
      {/* HVAC unit on top */}
      <mesh position={[-5.5, 2.8, 4]}>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ── KC Skyline beyond the parapet ── */}
      {/* One KC Place — tallest */}
      <mesh position={[-5, 14, -22]}>
        <boxGeometry args={[3, 28, 3]} />
        <meshStandardMaterial color="#2a2535" roughness={0.3} metalness={0.5} envMapIntensity={1.5} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`okc-w-${i}`} position={[-5, 2 + i * 2.2, -20.4]}>
          <planeGeometry args={[2.5, 0.5]} />
          <meshStandardMaterial color="#aaddff" emissive="#88bbdd" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Town Pavilion */}
      <mesh position={[-1, 12, -20]}>
        <boxGeometry args={[3.5, 24, 3.5]} />
        <meshStandardMaterial color="#3a3545" roughness={0.3} metalness={0.4} envMapIntensity={1.5} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`tp-w-${i}`} position={[-1, 2 + i * 2.3, -18.2]}>
          <planeGeometry args={[3, 0.6]} />
          <meshStandardMaterial color="#ffd088" emissive="#ffaa44" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Power & Light tower */}
      <mesh position={[4, 16, -24]}>
        <boxGeometry args={[2.5, 32, 2.5]} />
        <meshStandardMaterial color="#4a4555" roughness={0.2} metalness={0.6} envMapIntensity={2} />
      </mesh>
      <mesh position={[4, 32.5, -24]}>
        <sphereGeometry args={[0.4, 6, 6]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={5} />
      </mesh>

      {/* Western Auto */}
      <mesh position={[9, 10, -18]}>
        <boxGeometry args={[2.5, 20, 2.5]} />
        <meshStandardMaterial color="#3a3040" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[9, 20.5, -17]}>
        <planeGeometry args={[2, 0.6]} />
        <meshStandardMaterial color="#ff6644" emissive="#ff4422" emissiveIntensity={4} />
      </mesh>

      {/* Kauffman Center — curved silhouette */}
      <mesh position={[-9, 6, -20]}>
        <sphereGeometry args={[5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#c0c0c8" roughness={0.15} metalness={0.5} envMapIntensity={2} />
      </mesh>

      {/* Distant buildings for depth */}
      {[[-13, 8, -26], [13, 7, -28], [-9, 5, -30], [8, 9, -27], [0, 6, -32], [-3, 10, -28], [6, 4, -30]].map(([bx, bh, bz], i) => (
        <mesh key={`dist-${i}`} position={[bx, bh / 2, bz]}>
          <boxGeometry args={[2.5 + i * 0.2, bh, 2.5]} />
          <meshStandardMaterial color={`hsl(${240 + i * 8}, 15%, ${14 + i * 2}%)`} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}

      {/* ── City glow on horizon ── */}
      <mesh position={[0, 3, -35]} rotation-x={0}>
        <planeGeometry args={[60, 8]} />
        <meshStandardMaterial color="#ff9955" emissive="#ff7733" emissiveIntensity={0.15} transparent opacity={0.04} />
      </mesh>

      {/* ── Warm rooftop lighting ── */}
      <pointLight position={[0, 3.5, -5]} intensity={0.8} color="#ffcc88" distance={8} decay={2} />
      <pointLight position={[5, 2, -5]} intensity={0.5} color="#ffbb88" distance={6} decay={2} />
    </group>
  );
}

/* ================================================================== */
/*  Connecting street sections between zones                           */
/* ================================================================== */
function ConnectingStreet({ fromZ, toZ }: { fromZ: number; toZ: number }) {
  const isMobile = useStore((s) => s.isMobile);
  const midZ = (fromZ + toZ) / 2;
  const len = Math.abs(fromZ - toZ);
  const count = isMobile ? 2 : 3;

  const items = useMemo(() => {
    const r: React.ReactElement[] = [];
    const rand = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < count; i++) {
      const z = fromZ - 2 - i * (len / (count + 1));
      const seed = Math.abs(Math.round(z * 7));
      const styles: Array<"brick" | "plaster" | "modern"> = ["brick", "plaster", "modern"];
      r.push(<BuildingFacade key={`cbl-${midZ}-${i}`} position={[-7, 0, z]} width={3.5} height={4 + rand(seed) * 5} depth={3} style={styles[i % 3]} windowGlow={0.4 + rand(seed) * 0.3} />);
      r.push(<BuildingFacade key={`cbr-${midZ}-${i}`} position={[7, 0, z]} width={3.5} height={4 + rand(seed + 1) * 5} depth={3} style={styles[(i + 1) % 3]} windowGlow={0.3 + rand(seed + 1) * 0.3} />);
      r.push(<RealStreetLamp key={`csl-${midZ}-${i}`} position={[-4.5, 0, z]} />);
      r.push(<RealStreetLamp key={`csr-${midZ}-${i}`} position={[4.5, 0, z]} />);
    }
    return r;
  }, [fromZ, len, count, midZ]);

  return <>{items}</>;
}

/* ================================================================== */
/*  Warm particles                                                     */
/* ================================================================== */
function WarmParticles() {
  const isMobile = useStore((s) => s.isMobile);
  const count = isMobile ? 20 : 45;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 5 + 1;
      arr[i * 3 + 2] = Math.random() * -130;
    }
    return arr;
  }, [count]);
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.05} color="#ffddaa" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

/* ================================================================== */
/*  Stop markers                                                       */
/* ================================================================== */
function StopMarker({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1;
  });
  return (
    <mesh ref={ref as React.RefObject<THREE.Mesh>} rotation-x={-Math.PI / 2} position={position}>
      <circleGeometry args={[1, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.25} />
    </mesh>
  );
}

/* ================================================================== */
/*  MAIN SCENE                                                         */
/* ================================================================== */
export default function CityScene() {
  const { worldPhase, isMobile } = useStore();
  const targetZ = PHASE_POSITIONS[worldPhase] ?? 0;

  return (
    <>
      <CityEnvironment />
      <ambientLight intensity={isMobile ? 0.3 : 0.2} color="#ffd0a0" />
      {!isMobile && <directionalLight position={[-6, 10, -4]} intensity={0.6} color="#ffbb77" />}

      <CameraRig targetZ={targetZ} />
      <Ground />

      {/* Zone 1: KC Street — start to date selection */}
      <StreetZone />

      {/* Connecting streets between zones — longer walks */}
      <ConnectingStreet fromZ={-12} toZ={-30} />
      <ConnectingStreet fromZ={-42} toZ={-60} />
      <ConnectingStreet fromZ={-72} toZ={-90} />

      {/* Zone 2: Restaurant */}
      <RestaurantZone />

      {/* Zone 3: Speakeasy */}
      <SpeakeasyZone />

      {/* Zone 4: Rooftop */}
      <RooftopZone />

      <WarmParticles />

      {/* Stop markers */}
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.mainStreet]} color="#ffcc66" />
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.dinner]} color="#ff9955" />
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.activity]} color="#ff6688" />
      <StopMarker position={[0, 0.02, PHASE_POSITIONS.drinks]} color="#ffaa55" />

      <CharacterPair targetZ={targetZ} />
    </>
  );
}
