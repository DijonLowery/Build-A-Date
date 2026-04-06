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

export function DuskSkybox() {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    const cube = loader.load(duskFaces);
    cube.colorSpace = THREE.SRGBColorSpace;
    scene.background = cube;

    return () => {
      if (scene.background === cube) {
        scene.background = null;
      }
      cube.dispose();
    };
  }, [scene]);

  return null;
}
