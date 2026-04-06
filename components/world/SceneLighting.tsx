"use client";

import { useEffect, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import type { JourneyPhase } from "@/components/world/RouteController";

export function SceneLighting({
  phase,
  plazaActive = false,
  powerActive = false,
  rooftopActive = false
}: {
  phase: JourneyPhase;
  plazaActive?: boolean;
  powerActive?: boolean;
  rooftopActive?: boolean;
}) {
  const { gl, scene } = useThree();
  const plazaLightRef = useRef<THREE.PointLight>(null);
  const bloomLightRef = useRef<THREE.PointLight>(null);
  const powerLightRef = useRef<THREE.PointLight>(null);
  const powerAccentRef = useRef<THREE.PointLight>(null);
  const rooftopGlowRef = useRef<THREE.PointLight>(null);
  const rooftopSkyRef = useRef<THREE.PointLight>(null);
  const plazaSpotRef = useRef<THREE.SpotLight>(null);
  const powerSpotRef = useRef<THREE.SpotLight>(null);
  const rooftopSpotRef = useRef<THREE.SpotLight>(null);
  const plazaTargetRef = useRef<THREE.Object3D>(null);
  const powerTargetRef = useRef<THREE.Object3D>(null);
  const rooftopTargetRef = useRef<THREE.Object3D>(null);

  const environmentFile =
    phase === "introBrief" || phase === "walkingDate" || phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate" || phase === "leavingDate"
      ? "/hdri/sunset_jhbcentral_1k.hdr"
      : plazaActive
        ? "/hdri/sunset_jhbcentral_1k.hdr"
        : phase === "walkingDrinks"
          ? "/hdri/sunset_jhbcentral_1k.hdr"
        : rooftopActive
          ? "/hdri/rooftop_night_1k.hdr"
          : "/hdri/modern_evening_street_1k.hdr";

  const hdriTexture = useLoader(RGBELoader, environmentFile);

  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    const envMap = pmremGenerator.fromEquirectangular(hdriTexture).texture;
    scene.environment = envMap;
    scene.environmentIntensity = rooftopActive ? 0.92 : plazaActive ? 0.96 : powerActive ? 0.88 : 0.94;

    return () => {
      if (scene.environment === envMap) {
        scene.environment = null;
      }
      envMap.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, hdriTexture, scene, plazaActive, powerActive, rooftopActive]);

  useEffect(() => {
    if (plazaSpotRef.current && plazaTargetRef.current) {
      plazaSpotRef.current.target = plazaTargetRef.current;
    }
    if (powerSpotRef.current && powerTargetRef.current) {
      powerSpotRef.current.target = powerTargetRef.current;
    }
    if (rooftopSpotRef.current && rooftopTargetRef.current) {
      rooftopSpotRef.current.target = rooftopTargetRef.current;
    }
  }, []);

  useFrame((_, delta) => {
    if (plazaLightRef.current) {
      plazaLightRef.current.intensity = THREE.MathUtils.damp(plazaLightRef.current.intensity, plazaActive ? 1.72 : 0.36, 3.8, delta);
    }

    if (bloomLightRef.current) {
      bloomLightRef.current.intensity = THREE.MathUtils.damp(bloomLightRef.current.intensity, plazaActive ? 1.18 : 0.2, 3.4, delta);
    }

    if (powerLightRef.current) {
      powerLightRef.current.intensity = THREE.MathUtils.damp(powerLightRef.current.intensity, powerActive ? 1.18 : 0.12, 3.4, delta);
    }

    if (powerAccentRef.current) {
      powerAccentRef.current.intensity = THREE.MathUtils.damp(powerAccentRef.current.intensity, powerActive ? 0.92 : 0.08, 3.2, delta);
    }

    if (rooftopGlowRef.current) {
      rooftopGlowRef.current.intensity = THREE.MathUtils.damp(rooftopGlowRef.current.intensity, rooftopActive ? 1.22 : 0.1, 3.2, delta);
    }

    if (rooftopSkyRef.current) {
      rooftopSkyRef.current.intensity = THREE.MathUtils.damp(rooftopSkyRef.current.intensity, rooftopActive ? 1.12 : 0.16, 3.2, delta);
    }

    if (plazaSpotRef.current) {
      plazaSpotRef.current.intensity = THREE.MathUtils.damp(plazaSpotRef.current.intensity, plazaActive ? 1.68 : 0.24, 3.6, delta);
    }

    if (powerSpotRef.current) {
      powerSpotRef.current.intensity = THREE.MathUtils.damp(powerSpotRef.current.intensity, powerActive ? 2.2 : 0.3, 3.4, delta);
    }

    if (rooftopSpotRef.current) {
      rooftopSpotRef.current.intensity = THREE.MathUtils.damp(rooftopSpotRef.current.intensity, rooftopActive ? 1.84 : 0.26, 3.2, delta);
    }
  });

  return (
    <>
      <ambientLight intensity={rooftopActive ? 0.3 : powerActive ? 0.42 : plazaActive ? 0.52 : 0.48} />
      <hemisphereLight
        args={
          plazaActive
            ? ["#f2b492", "#2c1c1a", 0.82]
            : phase === "introBrief" || phase === "walkingDate" || phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate" || phase === "leavingDate"
              ? ["#efb28f", "#332028", 0.9]
              : rooftopActive
                ? ["#b6b8de", "#1d1520", 0.56]
                : ["#8ea6c7", "#241722", 0.72]
        }
      />

      <directionalLight
        castShadow
        color="#ffd6ad"
        intensity={rooftopActive ? 0.9 : 1.16}
        position={[8.4, 12, 16]}
        shadow-bias={-0.00008}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      <object3D position={[1.8, 0.8, -65.8]} ref={plazaTargetRef} />
      <spotLight
        angle={0.42}
        castShadow
        color="#ffc38a"
        distance={42}
        intensity={0.24}
        penumbra={0.72}
        position={[2.8, 8.2, -60.4]}
        ref={plazaSpotRef}
        shadow-bias={-0.00008}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      <object3D position={[-0.8, 1.2, -107.8]} ref={powerTargetRef} />
      <spotLight
        angle={0.46}
        castShadow
        color="#ffd0a4"
        distance={34}
        intensity={0.3}
        penumbra={0.84}
        position={[0.8, 8.6, -101.2]}
        ref={powerSpotRef}
        shadow-bias={-0.00008}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      <object3D position={[7, 5.2, -131.4]} ref={rooftopTargetRef} />
      <spotLight
        angle={0.38}
        castShadow
        color="#ffd7b0"
        distance={28}
        intensity={0.26}
        penumbra={0.88}
        position={[7.8, 10.2, -127.4]}
        ref={rooftopSpotRef}
        shadow-bias={-0.00008}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      <pointLight color="#6ba9ff" distance={34} intensity={1.18} position={[0, 7.4, -26]} />
      <pointLight color="#ffbf74" distance={22} intensity={1.02} position={[0, 4.8, -11]} />
      <pointLight color="#ffb96c" distance={16} intensity={0.76} position={[-5.6, 3.8, -12]} />
      <pointLight color="#ffb96c" distance={16} intensity={0.74} position={[5.8, 3.8, -16]} />
      <pointLight color="#ffd09d" distance={42} intensity={0.68} position={[0.6, 8.4, -34]} />

      <pointLight color="#ffc289" distance={38} intensity={0.36} position={[2.6, 5.2, -62.5]} ref={plazaLightRef} />
      <pointLight color="#ffe0b7" distance={28} intensity={0.2} position={[1.4, 3.8, -66]} ref={bloomLightRef} />
      <pointLight color="#ffb979" distance={16} intensity={0.44} position={[-10.8, 3.4, -67.8]} />
      <pointLight color="#ffb979" distance={16} intensity={0.42} position={[10.6, 3.4, -69]} />
      <pointLight color="#ffcf93" distance={18} intensity={0.56} position={[1.8, 3.6, -74.6]} />

      <pointLight color="#7db6ff" distance={34} intensity={0.12} position={[-2.2, 5.2, -93.5]} ref={powerLightRef} />
      <pointLight color="#f6b96e" distance={26} intensity={0.08} position={[-0.4, 4.4, -98.4]} ref={powerAccentRef} />
      <pointLight color="#ffb46f" distance={16} intensity={0.44} position={[-4.4, 3.2, -103.4]} />
      <pointLight color="#ffb46f" distance={16} intensity={0.44} position={[2.8, 3.2, -104.2]} />

      <pointLight color="#ffc18d" distance={26} intensity={0.1} position={[6.1, 5.6, -128.4]} ref={rooftopGlowRef} />
      <pointLight color="#9cc6ff" distance={38} intensity={0.16} position={[4.6, 8.4, -134]} ref={rooftopSkyRef} />
      <pointLight color="#ffb476" distance={18} intensity={0.42} position={[9.8, 6.6, -127.2]} />
      <pointLight color="#ffb476" distance={18} intensity={0.38} position={[3.2, 6.4, -126.8]} />
    </>
  );
}
