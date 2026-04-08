"use client";

import { useEffect, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import type { JourneyPhase } from "@/components/world/RouteController";

const HDRI_PATHS = [
  "/hdri/sunset_jhbcentral_1k.hdr",
  "/hdri/rooftop_night_1k.hdr",
  "/hdri/modern_evening_street_1k.hdr"
] as const;

function EnvironmentLighting({
  environmentFile,
  plazaActive,
  powerActive,
  rooftopActive
}: {
  environmentFile: string;
  plazaActive: boolean;
  powerActive: boolean;
  rooftopActive: boolean;
}) {
  const { gl, scene } = useThree();
  const hdriTexture = useLoader(RGBELoader, environmentFile);

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

  return null;
}

export function SceneLighting({
  phase,
  plazaActive = false,
  powerActive = false,
  rooftopActive = false,
  mobileView = false
}: {
  phase: JourneyPhase;
  plazaActive?: boolean;
  powerActive?: boolean;
  rooftopActive?: boolean;
  mobileView?: boolean;
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

  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

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
      {!mobileView ? (
        <EnvironmentLighting
          environmentFile={environmentFile}
          plazaActive={plazaActive}
          powerActive={powerActive}
          rooftopActive={rooftopActive}
        />
      ) : null}
      <ambientLight intensity={mobileView ? (rooftopActive ? 0.76 : powerActive ? 0.9 : plazaActive ? 1.02 : 0.96) : rooftopActive ? 0.3 : powerActive ? 0.42 : plazaActive ? 0.52 : 0.48} />
      <hemisphereLight
        args={
          plazaActive
            ? ["#f2b492", "#2c1c1a", mobileView ? 1.22 : 0.82]
            : phase === "introBrief" || phase === "walkingDate" || phase === "arrivedDate" || phase === "selectingDate" || phase === "lockedDate" || phase === "leavingDate"
              ? ["#efb28f", "#332028", mobileView ? 1.34 : 0.9]
              : rooftopActive
                ? ["#b6b8de", "#1d1520", mobileView ? 1.02 : 0.56]
                : ["#8ea6c7", "#241722", mobileView ? 1.08 : 0.72]
        }
      />

      <directionalLight
        castShadow={!mobileView}
        color="#ffd6ad"
        intensity={mobileView ? (rooftopActive ? 1.38 : 1.64) : rooftopActive ? 0.9 : 1.16}
        position={[8.4, 12, 16]}
        shadow-bias={-0.00008}
        shadow-mapSize-height={mobileView ? 512 : 1024}
        shadow-mapSize-width={mobileView ? 512 : 1024}
      />

      <pointLight color="#ffd6a3" distance={58} intensity={mobileView ? 1.36 : 0.54} position={[0.6, 8.4, -18]} />
      <pointLight color="#9cc2ff" distance={64} intensity={mobileView ? 0.88 : 0.24} position={[0, 11.2, -36]} />
      <pointLight color="#ffc38e" distance={54} intensity={mobileView ? 1.06 : 0.34} position={[0, 5.4, -68]} />
      <pointLight color="#fff0d2" distance={44} intensity={mobileView ? 1.12 : 0.22} position={[0.2, 3.6, 6]} />

      {!mobileView || plazaActive ? <object3D position={[1.8, 0.8, -65.8]} ref={plazaTargetRef} /> : null}
      {!mobileView || plazaActive ? (
        <spotLight
          angle={0.42}
          castShadow={!mobileView}
          color="#ffc38a"
          distance={42}
          intensity={0.24}
          penumbra={0.72}
          position={[2.8, 8.2, -60.4]}
          ref={plazaSpotRef}
          shadow-bias={-0.00008}
          shadow-mapSize-height={mobileView ? 512 : 1024}
          shadow-mapSize-width={mobileView ? 512 : 1024}
        />
      ) : null}

      {!mobileView || powerActive ? <object3D position={[-0.8, 1.2, -107.8]} ref={powerTargetRef} /> : null}
      {!mobileView || powerActive ? (
        <spotLight
          angle={0.46}
          castShadow={!mobileView}
          color="#ffd0a4"
          distance={34}
          intensity={0.3}
          penumbra={0.84}
          position={[0.8, 8.6, -101.2]}
          ref={powerSpotRef}
          shadow-bias={-0.00008}
          shadow-mapSize-height={mobileView ? 512 : 1024}
          shadow-mapSize-width={mobileView ? 512 : 1024}
        />
      ) : null}

      {!mobileView || rooftopActive ? <object3D position={[7, 5.2, -131.4]} ref={rooftopTargetRef} /> : null}
      {!mobileView || rooftopActive ? (
        <spotLight
          angle={0.38}
          castShadow={!mobileView}
          color="#ffd7b0"
          distance={28}
          intensity={0.26}
          penumbra={0.88}
          position={[7.8, 10.2, -127.4]}
          ref={rooftopSpotRef}
          shadow-bias={-0.00008}
          shadow-mapSize-height={mobileView ? 512 : 1024}
          shadow-mapSize-width={mobileView ? 512 : 1024}
        />
      ) : null}

      <pointLight color="#6ba9ff" distance={34} intensity={1.18} position={[0, 7.4, -26]} />
      <pointLight color="#ffbf74" distance={22} intensity={1.02} position={[0, 4.8, -11]} />
      {!mobileView ? <pointLight color="#ffb96c" distance={16} intensity={0.76} position={[-5.6, 3.8, -12]} /> : null}
      {!mobileView ? <pointLight color="#ffb96c" distance={16} intensity={0.74} position={[5.8, 3.8, -16]} /> : null}
      {!mobileView ? <pointLight color="#ffd09d" distance={42} intensity={0.68} position={[0.6, 8.4, -34]} /> : null}

      <pointLight color="#ffc289" distance={38} intensity={0.36} position={[2.6, 5.2, -62.5]} ref={plazaLightRef} />
      <pointLight color="#ffe0b7" distance={28} intensity={0.2} position={[1.4, 3.8, -66]} ref={bloomLightRef} />
      {!mobileView ? <pointLight color="#ffb979" distance={16} intensity={0.44} position={[-10.8, 3.4, -67.8]} /> : null}
      {!mobileView ? <pointLight color="#ffb979" distance={16} intensity={0.42} position={[10.6, 3.4, -69]} /> : null}
      {!mobileView || plazaActive ? <pointLight color="#ffcf93" distance={18} intensity={0.56} position={[1.8, 3.6, -74.6]} /> : null}

      <pointLight color="#7db6ff" distance={34} intensity={0.12} position={[-2.2, 5.2, -93.5]} ref={powerLightRef} />
      <pointLight color="#f6b96e" distance={26} intensity={0.08} position={[-0.4, 4.4, -98.4]} ref={powerAccentRef} />
      {!mobileView ? <pointLight color="#ffb46f" distance={16} intensity={0.44} position={[-4.4, 3.2, -103.4]} /> : null}
      {!mobileView ? <pointLight color="#ffb46f" distance={16} intensity={0.44} position={[2.8, 3.2, -104.2]} /> : null}

      <pointLight color="#ffc18d" distance={26} intensity={0.1} position={[6.1, 5.6, -128.4]} ref={rooftopGlowRef} />
      <pointLight color="#9cc6ff" distance={38} intensity={0.16} position={[4.6, 8.4, -134]} ref={rooftopSkyRef} />
      {!mobileView ? <pointLight color="#ffb476" distance={18} intensity={0.42} position={[9.8, 6.6, -127.2]} /> : null}
      {!mobileView ? <pointLight color="#ffb476" distance={18} intensity={0.38} position={[3.2, 6.4, -126.8]} /> : null}
    </>
  );
}

HDRI_PATHS.forEach((path) => {
  useLoader.preload(RGBELoader, path);
});
