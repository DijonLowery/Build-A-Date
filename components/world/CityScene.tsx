"use client";

import { RoundedBox, Stars, useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import type { JourneyPhase } from "@/components/world/RouteController";

type CitySceneProps = {
  mobileView: boolean;
  phase: JourneyPhase;
  selectedActivityId: string | null;
  selectedDinnerId: string | null;
  selectedDrinksId: string | null;
};

const STREET_LAMP_MODEL = "/models/street-lamp.glb";
const UNION_STATION_MODEL = "/models/union-station-kc.glb";
const ORNATE_STREET_PROP_MODEL = "/models/ornate-street-prop.glb";
const JAZZ_BAND_MODEL = "/models/jazz-band.glb";

function prepareTexture(texture: THREE.Texture, repeatX: number, repeatY: number) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
}

function useFacadeTextures(kind: "brick" | "plaster", repeatX: number, repeatY: number) {
  const [colorMap, normalMap] = useTexture(
    kind === "brick"
      ? ["/models/brick_diff.jpg", "/models/brick_normal.jpg"]
      : ["/models/plaster_diff.jpg", "/models/plaster_normal.jpg"]
  );

  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    prepareTexture(colorMap, repeatX, repeatY);
    prepareTexture(normalMap, repeatX, repeatY);
  }, [colorMap, normalMap, repeatX, repeatY]);

  return { colorMap, normalMap };
}

function StaticEnvironmentModel({
  path,
  position,
  rotation = [0, 0, 0],
  targetHeight
}: {
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  targetHeight: number;
}) {
  const { scene } = useGLTF(path);
  const model = useMemo(() => clone(scene), [scene]);
  const { anchor, scale } = useMemo(() => {
    model.traverse((child) => {
      if ("castShadow" in child) {
        child.castShadow = true;
      }

      if ("receiveShadow" in child) {
        child.receiveShadow = true;
      }

      if ("material" in child) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((material) => {
          if (!(material instanceof THREE.Material)) {
            return;
          }

          if ("envMapIntensity" in material) {
            material.envMapIntensity = 1.25;
          }

          material.needsUpdate = true;
        });
      }
    });

    const box = new THREE.Box3();
    let hasMesh = false;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        hasMesh = true;
        box.expandByObject(child);
      }
    });
    if (!hasMesh) {
      box.setFromObject(model);
    }
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const baseScale = targetHeight / Math.max(size.y, 0.001);
    const boostedScale = baseScale * 3;

    return {
      anchor: new THREE.Vector3(center.x, box.min.y, center.z),
      scale: boostedScale
    };
  }, [model, targetHeight]);

  const useFallbackBand = useMemo(() => {
    let count = 0;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        count += 1;
      }
    });
    return count < 4;
  }, [model]);

  return (
    <group position={position} rotation={rotation}>
      <group
        position={[-anchor.x * scale, -anchor.y * scale, -anchor.z * scale]}
        scale={[scale, scale, scale]}
      >
        <primitive object={model} />
      </group>
    </group>
  );
}

function LiveBandModel({
  active,
  path,
  position,
  rotation = [0, 0, 0],
  targetHeight
}: {
  active: boolean;
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  targetHeight: number;
}) {
  const motionRef = useRef<THREE.Group | null>(null);
  const { gl } = useThree();
  const gltf = useLoader(GLTFLoader, path, (loader) => {
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath("/basis/");
    ktx2Loader.detectSupport(gl);
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const model = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, model);

  const { anchor, scale } = useMemo(() => {
    model.traverse((child) => {
      if ("castShadow" in child) {
        child.castShadow = true;
      }

      if ("receiveShadow" in child) {
        child.receiveShadow = true;
      }

      if ("material" in child) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((material) => {
          if (!(material instanceof THREE.Material)) {
            return;
          }

          const fallbackMaterial = new THREE.MeshStandardMaterial({
            color: "#2a2326",
            roughness: 0.68,
            metalness: 0.12
          });
          if (child instanceof THREE.Mesh) {
            child.material = fallbackMaterial;
          }
        });
      }
    });

    const box = new THREE.Box3();
    let hasMesh = false;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        hasMesh = true;
        box.expandByObject(child);
      }
    });
    if (!hasMesh) {
      box.setFromObject(model);
    }
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const baseScale = targetHeight / Math.max(size.y, 0.001);
    const boostedScale = THREE.MathUtils.clamp(baseScale * 1.2, 0.02, 0.3);

    return {
      anchor: new THREE.Vector3(center.x, box.min.y, center.z),
      scale: boostedScale
    };
  }, [model, targetHeight]);

  const useFallbackBand = useMemo(() => {
    let count = 0;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        count += 1;
      }
    });
    return count < 4;
  }, [model]);

  useEffect(() => {
    const clipActions = Object.values(actions).filter((action): action is NonNullable<typeof action> => Boolean(action));

    clipActions.forEach((action) => {
      action.reset();
      action.fadeIn(0.34);
      action.play();
      action.timeScale = active ? 0.92 : 0.72;
    });

    return () => {
      clipActions.forEach((action) => {
        action.fadeOut(0.2);
      });
    };
  }, [actions, active]);

  useFrame(({ clock }, delta) => {
    if (!motionRef.current) {
      return;
    }

    const baseLift = position[1];
    const baseTurn = 0;
    const bobAmount = active ? 0.06 : 0.025;
    const swayAmount = active ? 0.04 : 0.015;

    motionRef.current.position.y = THREE.MathUtils.damp(
      motionRef.current.position.y,
      baseLift + Math.sin(clock.elapsedTime * 1.4) * bobAmount,
      3.8,
      delta
    );
    motionRef.current.rotation.y = THREE.MathUtils.damp(
      motionRef.current.rotation.y,
      baseTurn + Math.sin(clock.elapsedTime * 0.84) * swayAmount,
      3.6,
      delta
    );

  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={motionRef}>
        {useFallbackBand ? (
          <group position={[0, 1.4, 0.6]}>
            {[-1.1, 0, 1.1].map((x, index) => (
              <group key={x} position={[x, 0, 0]}>
                <mesh castShadow position={[0, 0.6, 0]}>
                  <capsuleGeometry args={[0.18, 0.9, 8, 16]} />
                  <meshStandardMaterial color="#1c1a22" roughness={0.68} />
                </mesh>
                <mesh castShadow position={[0, 1.3, 0]}>
                  <sphereGeometry args={[0.26, 18, 18]} />
                  <meshStandardMaterial color="#8a5b43" roughness={0.7} />
                </mesh>
                {index === 1 ? (
                  <mesh castShadow position={[0, 0.2, 0.2]}>
                    <cylinderGeometry args={[0.28, 0.3, 0.2, 16]} />
                    <meshStandardMaterial color="#2a1f22" roughness={0.66} />
                  </mesh>
                ) : (
                  <mesh castShadow position={[0, 0.2, 0.2]}>
                    <boxGeometry args={[0.16, 0.54, 0.08]} />
                    <meshStandardMaterial color="#e0b56c" roughness={0.36} />
                  </mesh>
                )}
              </group>
            ))}
          </group>
        ) : null}
        <group
          position={[-anchor.x * scale, -anchor.y * scale, -anchor.z * scale]}
          scale={[scale, scale, scale]}
        >
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}

function TexturedStreet() {
  const [roadColor, roadNormal, plasterColor, plasterNormal] = useTexture([
    "/models/cobblestone_diff.jpg",
    "/models/cobblestone_normal.jpg",
    "/models/plaster_diff.jpg",
    "/models/plaster_normal.jpg"
  ]);

  useEffect(() => {
    roadColor.colorSpace = THREE.SRGBColorSpace;
    plasterColor.colorSpace = THREE.SRGBColorSpace;
    prepareTexture(roadColor, 2.6, 34);
    prepareTexture(roadNormal, 2.6, 34);
    prepareTexture(plasterColor, 1.4, 30);
    prepareTexture(plasterNormal, 1.4, 30);
  }, [plasterColor, plasterNormal, roadColor, roadNormal]);

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -58]}>
        <planeGeometry args={[11.4, 170]} />
        <meshPhysicalMaterial
          clearcoat={0.74}
          clearcoatRoughness={0.18}
          color="#8f766c"
          map={roadColor}
          normalMap={roadNormal}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          roughness={0.52}
        />
      </mesh>

      {[-7.8, 7.8].map((x) => (
        <mesh castShadow key={x} position={[x, 0.16, -58]}>
          <boxGeometry args={[3.4, 0.26, 170]} />
          <meshStandardMaterial
            color="#d8cdc5"
            map={plasterColor}
            normalMap={plasterNormal}
            normalScale={new THREE.Vector2(0.45, 0.45)}
            roughness={0.94}
          />
        </mesh>
      ))}
    </>
  );
}

function LandmarkBackdrop({ phase }: { phase: JourneyPhase }) {
  const dateOrDinnerMoment =
    phase === "walkingDate" ||
    phase === "arrivedDate" ||
    phase === "selectingDate" ||
    phase === "lockedDate" ||
    phase === "leavingDate" ||
    phase === "walkingDinner" ||
    phase === "arrivedDinner" ||
    phase === "selectingDinner" ||
    phase === "lockedDinner";
  const rooftopMoment =
    phase === "walkingDrinks" ||
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted";

  return (
    <group>
      {dateOrDinnerMoment ? (
        <StaticEnvironmentModel
          path={UNION_STATION_MODEL}
          position={[0.6, 0, -92]}
          rotation={[0, Math.PI, 0]}
          targetHeight={10.6}
        />
      ) : null}

      {rooftopMoment ? (
        <>
          <StaticEnvironmentModel
            path={UNION_STATION_MODEL}
            position={[-24, 0, -212]}
            rotation={[0, Math.PI, 0]}
            targetHeight={5.8}
          />
        </>
      ) : null}
    </group>
  );
}

function OrnateStreetProps() {
  const placements: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    targetHeight: number;
  }> = [
    { position: [-5.7, 0, -44], rotation: [0, Math.PI * 0.5, 0], targetHeight: 2.5 },
    { position: [5.9, 0, -72], rotation: [0, -Math.PI * 0.5, 0], targetHeight: 2.5 },
    { position: [-3.4, 4.9, -128.2], rotation: [0, 0.2, 0], targetHeight: 2.15 },
    { position: [10.4, 4.9, -128], rotation: [0, -0.2, 0], targetHeight: 2.15 }
  ];

  return (
    <>
      {placements.map((placement, index) => (
        <StaticEnvironmentModel
          key={index}
          path={ORNATE_STREET_PROP_MODEL}
          position={placement.position}
          rotation={placement.rotation}
          targetHeight={placement.targetHeight}
        />
      ))}
    </>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 4.2, 16]} />
        <meshStandardMaterial color="#2b2630" metalness={0.32} roughness={0.66} />
      </mesh>
      <mesh castShadow position={[0.34, 3.52, 0]} rotation={[0, 0, Math.PI / 3]}>
        <cylinderGeometry args={[0.02, 0.025, 0.62, 10]} />
        <meshStandardMaterial color="#2b2630" metalness={0.28} roughness={0.62} />
      </mesh>
      <mesh position={[0.58, 3.5, 0]}>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color="#ffe0bb" emissive="#ffb26c" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight color="#ffbd79" distance={10} intensity={1.8} position={[0.56, 3.46, 0.08]} />
    </group>
  );
}

function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[1.32, 0.1, 0.42]} castShadow position={[0, 0.42, 0]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#2d2527" roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[1.32, 0.6, 0.1]} castShadow position={[0, 0.76, -0.16]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#2d2527" roughness={0.62} />
      </RoundedBox>
      {[-0.54, 0.54].map((x) => (
        <mesh castShadow key={x} position={[x, 0.2, 0.12]}>
          <boxGeometry args={[0.08, 0.42, 0.08]} />
          <meshStandardMaterial color="#18161a" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      {[-0.54, 0.54].map((x) => (
        <mesh castShadow key={`back-${x}`} position={[x, 0.45, -0.18]}>
          <boxGeometry args={[0.08, 0.78, 0.08]} />
          <meshStandardMaterial color="#18161a" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function TrashCan({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.64, 20]} />
        <meshStandardMaterial color="#35333a" metalness={0.4} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.2, 0.16, 0.08, 20]} />
        <meshStandardMaterial color="#27242b" metalness={0.42} roughness={0.52} />
      </mesh>
    </group>
  );
}

function FireHydrant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.4, 16]} />
        <meshStandardMaterial color="#d94d43" roughness={0.46} />
      </mesh>
      <mesh castShadow position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.14, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#d94d43" roughness={0.46} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh castShadow key={x} position={[x, 0.28, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.14, 12]} />
          <meshStandardMaterial color="#d94d43" roughness={0.46} />
        </mesh>
      ))}
    </group>
  );
}

function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.76, 0.34, 0.76]} castShadow position={[0, 0.18, 0]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#6c605d" roughness={0.82} />
      </RoundedBox>
      <mesh castShadow position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshStandardMaterial color="#39553d" roughness={0.96} />
      </mesh>
    </group>
  );
}

function Crosswalk({ z }: { z: number }) {
  return (
    <group position={[0, 0.012, z]}>
      {Array.from({ length: 7 }).map((_, index) => (
        <mesh key={index} receiveShadow position={[0, 0, -2.1 + index * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.1, 0.28]} />
          <meshStandardMaterial color="#efe7dd" opacity={0.82} roughness={0.52} transparent />
        </mesh>
      ))}
    </group>
  );
}

function DashedCenterLine() {
  return (
    <>
      {Array.from({ length: 26 }).map((_, index) => (
        <mesh key={index} position={[0, 0.016, 14 - index * 5.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 1.4]} />
          <meshBasicMaterial color="#f6ede2" opacity={0.16} transparent />
        </mesh>
      ))}
    </>
  );
}

function NeonSign({
  color,
  label,
  position,
  rotation = 0,
  width = 1.46
}: {
  color: string;
  label: string;
  position: [number, number, number];
  rotation?: number;
  width?: number;
}) {
  const colorObject = useMemo(() => new THREE.Color(color), [color]);
  const emissive = useMemo(() => colorObject.clone().multiplyScalar(1.8), [colorObject]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[width, 0.3, 0.06]} position={[0, 0, 0]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#1a1820" metalness={0.3} roughness={0.42} />
      </RoundedBox>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[width * 0.82, 0.12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[width * 0.9, 0.18]} />
        <meshBasicMaterial color={color} opacity={0.18} toneMapped={false} transparent />
      </mesh>
      <pointLight color={emissive} distance={4} intensity={0.9} position={[0, 0, 0.32]} />
      <group position={[0, -0.34, 0.02]}>
        <mesh>
          <planeGeometry args={[width * 0.9, 0.12]} />
          <meshBasicMaterial color="#fff4e7" opacity={0.72} transparent />
        </mesh>
      </group>
      <mesh position={[0, -0.34, 0.021]}>
        <planeGeometry args={[width * 0.84, 0.08]} />
        <meshBasicMaterial color="#fff6eb" opacity={0.86} transparent />
      </mesh>
      <group position={[0, -0.34, 0.03]}>
        <mesh>
          <planeGeometry args={[width * 0.84, 0.08]} />
          <meshBasicMaterial color="#fff6eb" opacity={0} transparent />
        </mesh>
      </group>
      <group position={[0, -0.34, 0.04]}>
        <mesh>
          <planeGeometry args={[width * 0.01, 0.01]} />
          <meshBasicMaterial color="#fff6eb" opacity={0} transparent />
        </mesh>
      </group>
    </group>
  );
}

function Storefront({
  accent,
  glow,
  position,
  scale,
  warm = false
}: {
  accent: string;
  glow: string;
  position: [number, number, number];
  scale: [number, number, number];
  warm?: boolean;
}) {
  const { colorMap: plasterColor, normalMap: plasterNormal } = useFacadeTextures("plaster", 1.2, 2.8);
  const { colorMap: brickColor, normalMap: brickNormal } = useFacadeTextures("brick", 1.6, 2.6);

  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[2.7, 5.8, 2.2]} castShadow position={[0, 2.9, 0]} radius={0.18} smoothness={6}>
        <meshPhysicalMaterial
          color={warm ? "#bb9788" : "#9b97a2"}
          envMapIntensity={1.18}
          map={warm ? brickColor : plasterColor}
          normalMap={warm ? brickNormal : plasterNormal}
          normalScale={new THREE.Vector2(0.45, 0.45)}
          roughness={0.76}
        />
      </RoundedBox>
      {[-1.1, 1.1].map((x) => (
        <RoundedBox args={[0.18, 4.3, 0.28]} castShadow key={x} position={[x, 2.12, 1.08]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color={warm ? "#b48a7f" : "#8895a8"}
            map={brickColor}
            normalMap={brickNormal}
            normalScale={new THREE.Vector2(0.28, 0.28)}
            roughness={0.72}
          />
        </RoundedBox>
      ))}
      <RoundedBox args={[2.5, 0.18, 0.42]} castShadow position={[0, 4.66, 1]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color={warm ? "#513733" : "#36445e"} roughness={0.58} />
      </RoundedBox>
      <RoundedBox args={[2.36, 1.6, 0.16]} castShadow position={[0, 1.18, 1.18]} radius={0.08} smoothness={6}>
        <meshPhysicalMaterial clearcoat={1} clearcoatRoughness={0.12} color="#d8d1cb" envMapIntensity={1.28} roughness={0.18} transmission={0.02} />
      </RoundedBox>
      <RoundedBox args={[2.1, 0.34, 0.1]} castShadow position={[0, 2.22, 1.16]} radius={0.08} smoothness={6}>
        <meshStandardMaterial color={accent} roughness={0.48} />
      </RoundedBox>
      <RoundedBox args={[1.86, 0.22, 0.62]} castShadow position={[0, 2.72, 0.94]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={warm ? "#714744" : "#435b80"} roughness={0.42} />
      </RoundedBox>
      <RoundedBox args={[0.64, 1.96, 0.1]} castShadow position={[0, 0.98, 1.24]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial clearcoat={0.94} clearcoatRoughness={0.18} color="#2e2830" envMapIntensity={1.34} roughness={0.16} />
      </RoundedBox>
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 1.15, 1.26]}>
          <planeGeometry args={[0.46, 1.04]} />
          <meshBasicMaterial color={warm ? "#ffddb6" : "#cfe3ff"} opacity={0.24} transparent />
        </mesh>
      ))}
      <mesh position={[0, 3.7, 1.18]}>
        <planeGeometry args={[1.26, 1.48]} />
        <meshBasicMaterial color={warm ? "#ffd2aa" : "#e0edff"} opacity={0.12} transparent />
      </mesh>
      <pointLight color={glow} distance={6} intensity={0.8} position={[0, 2.8, 1.6]} />
    </group>
  );
}

function UrbanBlock({
  accent,
  glow,
  height = 6.6,
  position,
  side = "left",
  width = 3.8
}: {
  accent: string;
  glow: string;
  height?: number;
  position: [number, number, number];
  side?: "left" | "right";
  width?: number;
}) {
  const direction = side === "left" ? 1 : -1;
  const { colorMap: brickColor, normalMap: brickNormal } = useFacadeTextures("brick", Math.max(width / 2.2, 1.4), Math.max(height / 2.4, 2));
  const { colorMap: plasterColor, normalMap: plasterNormal } = useFacadeTextures("plaster", Math.max(width / 2.8, 1.2), Math.max(height / 3.2, 1.8));

  return (
    <group position={position}>
      <RoundedBox args={[width, height, 2.8]} castShadow position={[0, height / 2, 0]} radius={0.14} smoothness={6}>
        <meshPhysicalMaterial
          color="#9f877d"
          envMapIntensity={1.16}
          map={brickColor}
          normalMap={brickNormal}
          normalScale={new THREE.Vector2(0.34, 0.34)}
          roughness={0.84}
        />
      </RoundedBox>

      <RoundedBox args={[width * 0.92, 0.24, 0.5]} castShadow position={[0, height - 0.26, 1.08]} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color="#d7cbc3"
          map={plasterColor}
          normalMap={plasterNormal}
          normalScale={new THREE.Vector2(0.22, 0.22)}
          roughness={0.68}
        />
      </RoundedBox>

      {[-1, 0, 1].map((column) => (
        <RoundedBox
          args={[0.24, height - 1, 0.26]}
          castShadow
          key={column}
          position={[column * (width / 3.4), (height - 1) / 2 + 0.34, 1.12]}
          radius={0.03}
          smoothness={4}
        >
          <meshStandardMaterial
            color="#d2c3b7"
            map={plasterColor}
            normalMap={plasterNormal}
            normalScale={new THREE.Vector2(0.18, 0.18)}
            roughness={0.72}
          />
        </RoundedBox>
      ))}

      {Array.from({ length: 3 }).map((_, row) =>
        [-1, 0, 1].map((column) => (
          <group key={`${row}-${column}`} position={[column * (width / 3.4), 1.8 + row * 1.46, 1.2]}>
            <RoundedBox args={[0.84, 1.02, 0.12]} castShadow radius={0.04} smoothness={4}>
              <meshPhysicalMaterial color="#1f2430" clearcoat={0.8} clearcoatRoughness={0.14} envMapIntensity={1.36} roughness={0.16} />
            </RoundedBox>
            <mesh position={[0, 0, 0.08]}>
              <planeGeometry args={[0.68, 0.84]} />
              <meshBasicMaterial color={row === 0 ? "#ffe1bc" : "#d6e7ff"} opacity={0.22 + row * 0.02} transparent />
            </mesh>
          </group>
        ))
      )}

      <RoundedBox args={[1.04, 1.84, 0.14]} castShadow position={[direction * 0.9, 1.02, 1.2]} radius={0.04} smoothness={4}>
        <meshPhysicalMaterial color="#27222a" clearcoat={0.82} clearcoatRoughness={0.18} envMapIntensity={1.2} roughness={0.2} />
      </RoundedBox>

      <RoundedBox args={[1.82, 0.18, 0.64]} castShadow position={[direction * 0.46, 2.44, 1]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={accent} roughness={0.38} />
      </RoundedBox>

      <mesh position={[direction * 0.46, 2.1, 1.34]}>
        <planeGeometry args={[1.36, 0.22]} />
        <meshBasicMaterial color={glow} opacity={0.24} transparent />
      </mesh>

      <pointLight color={glow} distance={5.4} intensity={0.52} position={[direction * 0.46, 2.6, 1.8]} />
    </group>
  );
}

function MainStreetBoard({ active }: { active: boolean }) {
  return (
    <group position={[2.7, 1.5, -18.8]}>
      <mesh castShadow position={[0, -1.2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.2, 16]} />
        <meshStandardMaterial color="#1a1820" roughness={0.54} />
      </mesh>
      <RoundedBox args={[1.34, 2.46, 0.3]} castShadow position={[0, 0.12, 0]} radius={0.28} smoothness={6}>
        <meshPhysicalMaterial color="#12131a" roughness={0.28} clearcoat={1} clearcoatRoughness={0.16} />
      </RoundedBox>
      <RoundedBox args={[0.98, 1.98, 0.08]} position={[0, 0.12, 0.18]} radius={0.15} smoothness={6}>
        <meshStandardMaterial color={active ? "#8ec0ff" : "#6f8ab0"} emissive={active ? "#5d89c9" : "#324257"} emissiveIntensity={active ? 0.72 : 0.22} />
      </RoundedBox>
      <pointLight color="#8ec0ff" distance={6} intensity={active ? 1.4 : 0.4} position={[0, 0.7, 0.9]} />
      <mesh position={[0, -0.9, 0.5]}>
        <planeGeometry args={[1.58, 0.34]} />
        <meshBasicMaterial color="#0f1217" opacity={0.78} transparent />
      </mesh>
    </group>
  );
}

function DinnerPocket({ active, selectedDinnerId }: { active: boolean; selectedDinnerId: string | null }) {
  const emphasisZ = selectedDinnerId === "chef-boyardijon" ? -54.6 : selectedDinnerId === "steakhouse" ? -48.8 : selectedDinnerId === "coopers-hawk" ? -51.2 : -55.4;

  return (
    <group>
      <mesh position={[1.2, 4.2, -56]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.8, 48]} />
        <meshBasicMaterial color="#ffc387" opacity={active ? 0.12 : 0.06} transparent />
      </mesh>
      <Storefront accent="#804b40" glow="#ffba84" position={[-6.2, 0, -48.6]} scale={[1.06, 1.08, 1]} warm />
      <Storefront accent="#405f7f" glow="#8ec1ff" position={[-6.4, 0, -58.4]} scale={[1.08, 1.16, 1]} />
      <Storefront accent="#7e5c4f" glow="#ffcb8f" position={[6.6, 0, -49.4]} scale={[1.02, 1.12, 1]} warm />
      <Storefront accent="#5b4543" glow="#ffbf8e" position={[6.4, 0, -59.4]} scale={[1.06, 1.1, 1]} warm />

      <NeonSign color="#ffb285" label="big time" position={[-6.2, 3.14, -47.18]} />
      <NeonSign color="#82b6ff" label="already know" position={[-6.4, 3.22, -57.02]} />
      <NeonSign color="#ffd7a8" label="let me lead" position={[6.6, 3.18, -48.02]} />
      <NeonSign color="#ffc0cc" label="chef boyardijon" position={[6.4, 3.16, -58.02]} />

      {[-3.4, 2.8, 0.8].map((x, index) => (
        <group key={index} position={[x, 0, -53.2 - index * 2.4]}>
          <mesh castShadow position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.56, 0.6, 0.08, 20]} />
            <meshStandardMaterial color="#4a3835" roughness={0.72} />
          </mesh>
          <mesh castShadow position={[0, 0.74, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.58, 12]} />
            <meshStandardMaterial color="#d8c0a6" roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.92, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#fff2de" emissive="#ffc38a" emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}

      <mesh position={[0.8, 0.04, emphasisZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.8, 2.8]} />
        <meshBasicMaterial color="#ffddba" opacity={active ? 0.09 : 0.04} transparent />
      </mesh>
    </group>
  );
}

function BandStage({ active, selectedActivityId }: { active: boolean; selectedActivityId: string | null }) {
  const speakerGlow = selectedActivityId === "music-vibes" ? 1.1 : 0.6;

  return (
    <group position={[-0.8, 0, -85.6]}>
      <Suspense fallback={null}>
        <LiveBandModel
          active={active}
          path={JAZZ_BAND_MODEL}
          position={[-0.6, 1.6, 0.4]}
          rotation={[0, Math.PI, 0]}
          targetHeight={5.2}
        />
      </Suspense>

      <pointLight color="#ffb97d" distance={14} intensity={active ? 2.4 : 0.9} position={[0, 4.8, 1.2]} />
      <pointLight color="#7db4ff" distance={12} intensity={active ? 1.8 : 0.6} position={[-1.8, 4.2, 0.8]} />
      <pointLight color="#ff98b3" distance={12} intensity={active ? 1.4 : 0.5} position={[1.8, 4, 0.8]} />
      {[-2.6, 2.6].map((x) => (
        <pointLight key={x} color={x < 0 ? "#6fa5ff" : "#ffbf7d"} distance={4.8} intensity={speakerGlow} position={[x, 0.8, 0.6]} />
      ))}
    </group>
  );
}

function RooftopDeck({ active, selectedDrinksId }: { active: boolean; selectedDrinksId: string | null }) {
  const highlightColor =
    selectedDrinksId === "xo-hifi"
      ? "#ffb88b"
      : selectedDrinksId === "hidden-favorite"
        ? "#a4c6ff"
        : selectedDrinksId === "city-views"
          ? "#ffd9b2"
          : "#f0bcd2";

  return (
    <group position={[6.2, 4.8, -132.4]}>
      <RoundedBox args={[19, 0.22, 12.4]} receiveShadow position={[0, 0, 0]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial color="#2b2123" roughness={0.32} clearcoat={0.74} clearcoatRoughness={0.18} />
      </RoundedBox>

      {[-8.2, -4.2, 0, 4.2, 8.2].map((x) => (
        <mesh castShadow key={x} position={[x, 1.24, -5.6]}>
          <boxGeometry args={[0.12, 2.5, 0.12]} />
          <meshStandardMaterial color="#1d1b22" roughness={0.66} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 2.42, -5.6]}>
        <boxGeometry args={[16.8, 0.12, 0.12]} />
        <meshStandardMaterial color="#1d1b22" roughness={0.66} />
      </mesh>

      <group position={[3.2, 0, -1.2]}>
        <mesh castShadow position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.7, 0.76, 0.12, 20]} />
          <meshStandardMaterial color="#4d3a35" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.74, 12]} />
          <meshStandardMaterial color="#d6bfaa" roughness={0.36} />
        </mesh>
        <mesh position={[-0.18, 0.86, 0.08]}>
          <cylinderGeometry args={[0.08, 0.06, 0.24, 16]} />
          <meshStandardMaterial color="#fff5ea" opacity={0.26} roughness={0.08} transparent />
        </mesh>
        <mesh position={[0.18, 0.9, 0.02]}>
          <cylinderGeometry args={[0.08, 0.06, 0.24, 16]} />
          <meshStandardMaterial color="#fff5ea" opacity={0.26} roughness={0.08} transparent />
        </mesh>
      </group>

      <pointLight color={highlightColor} distance={8} intensity={active ? 1.2 : 0.42} position={[0.4, 3.6, -3.2]} />
      <mesh position={[0, 6.8, -7.4]}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="#ffcb97" opacity={0.08} transparent />
      </mesh>
    </group>
  );
}

function SkylineCluster({ mobileView = false }: { mobileView?: boolean }) {
  const towers = [
    { x: -22.8, w: 7.2, h: 8.2, tint: "#2d2530" },
    { x: -14.2, w: 6.8, h: 10.8, tint: "#322832" },
    { x: -4.6, w: 8.6, h: 14.4, tint: "#2a2330" },
    { x: 6.2, w: 8.2, h: 12.8, tint: "#302733" },
    { x: 15.8, w: 6.4, h: 9.8, tint: "#342935" }
  ];

  return (
    <group position={[mobileView ? 7.1 : 6.4, mobileView ? 0.2 : 0, mobileView ? -186 : -192]}>
      {towers.map((tower, index) => (
        <group key={tower.x} position={[tower.x, 0, 0]}>
          <RoundedBox args={[tower.w, tower.h * 0.72, 6.2]} castShadow position={[0, tower.h * 0.36, 0]} radius={0.12} smoothness={4}>
            <meshStandardMaterial color={tower.tint} roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[tower.w * 0.7, tower.h * 0.24, 5.2]} castShadow position={[0, tower.h * 0.82, -0.18]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#261f29" roughness={0.88} />
          </RoundedBox>
          <RoundedBox args={[tower.w * 0.46, tower.h * 0.14, 4.4]} castShadow position={[0, tower.h * 0.98, -0.24]} radius={0.08} smoothness={4}>
            <meshStandardMaterial color="#211b25" roughness={0.86} />
          </RoundedBox>

          {[-1, 0, 1].map((column) =>
            Array.from({ length: Math.max(Math.floor(tower.h / 2.8), 2) }).map((_, row) => (
              <mesh key={`${column}-${row}`} position={[column * (tower.w / 4.2), 2 + row * 2.1, 2.04]}>
                <planeGeometry args={[tower.w * 0.16, 0.22]} />
                <meshBasicMaterial color="#ffd7b1" opacity={0.08 + row * 0.006} transparent />
              </mesh>
            ))
          )}

          {index % 2 === 0 ? (
            <mesh castShadow position={[0, tower.h + 0.8, -0.18]}>
              <cylinderGeometry args={[0.08, 0.08, 1.6, 10]} />
              <meshStandardMaterial color="#544a5b" roughness={0.72} />
            </mesh>
          ) : null}
        </group>
      ))}
      <mesh position={[0, mobileView ? 9.4 : 7.8, -4]}>
        <planeGeometry args={[mobileView ? 64 : 60, mobileView ? 17 : 15]} />
        <meshBasicMaterial color="#ffd5b2" opacity={mobileView ? 0.05 : 0.035} transparent />
      </mesh>
    </group>
  );
}

function AtmosphereBackdrop({ phase }: { phase: JourneyPhase }) {
  const twilightStars = phase === "finalReveal" || phase === "submitted";

  return (
    <group>
      {twilightStars ? <Stars count={90} depth={24} factor={1.1} fade radius={110} saturation={0} speed={0.08} /> : null}
    </group>
  );
}

export function CityScene({
  mobileView,
  phase,
  selectedActivityId,
  selectedDinnerId,
  selectedDrinksId
}: CitySceneProps) {
  const bandQueuedRef = useRef(false);
  const dinnerActive =
    phase === "walkingDinner" ||
    phase === "arrivedDinner" ||
    phase === "selectingDinner" ||
    phase === "lockedDinner";
  const activityActive =
    phase === "walkingActivity" ||
    phase === "arrivedActivity" ||
    phase === "selectingActivity" ||
    phase === "lockedActivity";
  const drinksActive =
    phase === "walkingDrinks" ||
    phase === "arrivedDrinks" ||
    phase === "selectingDrinks" ||
    phase === "lockedDrinks" ||
    phase === "finalReveal" ||
    phase === "submitted";

  useEffect(() => {
    if (bandQueuedRef.current || phase === "prologue" || phase === "transition") {
      return;
    }

    bandQueuedRef.current = true;
  }, [phase]);

  const lampPositions = useMemo(
    () =>
      Array.from({ length: mobileView ? 10 : 14 }, (_, index) => {
        const z = 18 - index * 10;
        return [
          [-6.2, 0, z] as [number, number, number],
          [6.2, 0, z - 4] as [number, number, number]
        ];
      }).flat(),
    [mobileView]
  );

  return (
    <group>
      <AtmosphereBackdrop phase={phase} />
      <Suspense
        fallback={
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -58]}>
            <planeGeometry args={[11.4, 170]} />
            <meshPhysicalMaterial color="#4a3936" roughness={0.42} clearcoat={0.52} clearcoatRoughness={0.18} />
          </mesh>
        }
      >
        <TexturedStreet />
      </Suspense>

      {[-5.64, 5.64].map((x) => (
        <mesh castShadow key={`curb-${x}`} position={[x, 0.22, -58]}>
          <boxGeometry args={[0.16, 0.34, 170]} />
          <meshStandardMaterial color="#726a68" roughness={0.82} />
        </mesh>
      ))}

      {[-0.9, 0.9].map((x) => (
        <mesh castShadow key={`rail-${x}`} position={[x, 0.05, -6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 78, 14]} />
          <meshStandardMaterial color="#8a8c93" metalness={0.72} roughness={0.24} />
        </mesh>
      ))}

      <DashedCenterLine />
      <Crosswalk z={-16.8} />
      <Crosswalk z={-50.8} />
      <Crosswalk z={-86.2} />
      <Crosswalk z={-126.2} />

      {lampPositions.map((position, index) => (
        <Lamp key={index} position={position} />
      ))}

      {[
        [-6.6, 0, 6.4],
        [6.4, 0, -6.2],
        [-6.4, 0, -28.4],
        [6.4, 0, -41.4],
        [-6.6, 0, -60.4],
        [6.2, 0, -76.2],
        [-6.6, 0, -97.2]
      ].map((position, index) => (
        <Bench key={index} position={position as [number, number, number]} rotation={position[0] < 0 ? Math.PI / 2 : -Math.PI / 2} />
      ))}

      {[
        [-5.9, 0, -10],
        [5.8, 0, -33],
        [-6, 0, -57],
        [5.9, 0, -92]
      ].map((position, index) => (
        <TrashCan key={index} position={position as [number, number, number]} />
      ))}

      {[
        [-5.2, 0, -18],
        [5.2, 0, -48],
        [-5.3, 0, -86]
      ].map((position, index) => (
        <FireHydrant key={index} position={position as [number, number, number]} />
      ))}

      {[
        [-6.2, 0, 10],
        [6.2, 0, -18],
        [-6.2, 0, -44],
        [6.2, 0, -70],
        [5.8, 0, -118]
      ].map((position, index) => (
        <Planter key={index} position={position as [number, number, number]} />
      ))}

      <Suspense fallback={null}>
        <Storefront accent="#6c4845" glow="#ffbb85" position={[-8.8, 0, -4]} scale={[1.2, 1.1, 1]} warm />
        <Storefront accent="#425a7d" glow="#86b5ff" position={[8.9, 0, -10]} scale={[1.1, 1.18, 1]} />
        <Storefront accent="#7c5749" glow="#ffcf8f" position={[-8.8, 0, -18]} scale={[1.18, 1.2, 1]} warm />
        <Storefront accent="#4b5f80" glow="#83b3ff" position={[8.8, 0, -24]} scale={[1.1, 1.16, 1]} />

        <UrbanBlock accent="#925c51" glow="#ffbe87" height={6.9} position={[-9.8, 0, 8]} side="left" width={4.2} />
        <UrbanBlock accent="#4e6a92" glow="#9bc2ff" height={7.6} position={[9.8, 0, 4]} side="right" width={4.4} />
        <UrbanBlock accent="#8a6256" glow="#ffcb96" height={7.1} position={[-9.8, 0, -34]} side="left" width={4.2} />
        <UrbanBlock accent="#566d92" glow="#a5c6ff" height={7.8} position={[9.8, 0, -40]} side="right" width={4.6} />
        <UrbanBlock accent="#7d5a53" glow="#ffc996" height={7.2} position={[-10, 0, -72]} side="left" width={4.4} />
        <UrbanBlock accent="#4b6388" glow="#95bfff" height={7.5} position={[10, 0, -78]} side="right" width={4.4} />
      </Suspense>

      <NeonSign color="#ffcf9b" label="main street" position={[-8.8, 3.18, -2.7]} />
      <NeonSign color="#7db2ff" label="streetcar" position={[8.9, 3.24, -8.7]} />
      <NeonSign color="#ffb799" label="date board" position={[-8.8, 3.22, -16.7]} />
      <NeonSign color="#86bbff" label="city glow" position={[8.8, 3.2, -22.7]} />

      <MainStreetBoard active={phase === "arrivedDate" || phase === "selectingDate"} />
      <Suspense fallback={null}>
        <DinnerPocket active={dinnerActive} selectedDinnerId={selectedDinnerId} />
      </Suspense>
      <BandStage active={activityActive} selectedActivityId={selectedActivityId} />
      <RooftopDeck active={drinksActive} selectedDrinksId={selectedDrinksId} />
      {drinksActive ? <SkylineCluster mobileView={mobileView} /> : null}
      <Suspense fallback={null}>
        <LandmarkBackdrop phase={phase} />
        <OrnateStreetProps />
      </Suspense>

    </group>
  );
}

useGLTF.preload(STREET_LAMP_MODEL);
useGLTF.preload(UNION_STATION_MODEL);
useGLTF.preload(ORNATE_STREET_PROP_MODEL);
useTexture.preload("/models/brick_diff.jpg");
useTexture.preload("/models/brick_normal.jpg");
useTexture.preload("/models/plaster_diff.jpg");
useTexture.preload("/models/plaster_normal.jpg");
