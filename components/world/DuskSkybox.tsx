"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const duskFaces = [
  "/skybox/dusk/px.svg",
  "/skybox/dusk/nx.svg",
  "/skybox/dusk/py.svg",
  "/skybox/dusk/ny.svg",
  "/skybox/dusk/pz.svg",
  "/skybox/dusk/nz.svg"
];

export function DuskSkybox({ mobileView = false }: { mobileView?: boolean }) {
  const { scene } = useThree();

  useEffect(() => {
    const previousBackground = scene.background;
    const previousIntensity = scene.backgroundIntensity;
    const previousBlurriness = scene.backgroundBlurriness;

    if (mobileView) {
      scene.background = new THREE.Color("#5d4a6d");
      scene.backgroundIntensity = 1;
      scene.backgroundBlurriness = 0;

      return () => {
        if (scene.background && scene.background instanceof THREE.Color) {
          scene.background = previousBackground;
        }
        scene.backgroundIntensity = previousIntensity;
        scene.backgroundBlurriness = previousBlurriness;
      };
    }

    const loader = new THREE.CubeTextureLoader();
    const cube = loader.load(duskFaces);
    cube.colorSpace = THREE.SRGBColorSpace;
    scene.background = cube;
    scene.backgroundIntensity = mobileView ? 1.4 : 1;
    scene.backgroundBlurriness = mobileView ? 0.03 : 0;

    return () => {
      if (scene.background === cube) {
        scene.background = previousBackground;
      }
      scene.backgroundIntensity = previousIntensity;
      scene.backgroundBlurriness = previousBlurriness;
      cube.dispose();
    };
  }, [mobileView, scene]);

  return null;
}
