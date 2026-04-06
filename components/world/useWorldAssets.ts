"use client";

import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

type WorldAssets = {
  asphaltFloorColor: THREE.Texture;
  asphaltFloorNormal: THREE.Texture;
  asphaltFloorRoughness: THREE.Texture;
  asphaltRoadColor: THREE.Texture;
  asphaltRoadNormal: THREE.Texture;
  asphaltRoadRoughness: THREE.Texture;
  brickFacadeColor: THREE.Texture;
  brickFacadeNormal: THREE.Texture;
  brickFacadeRoughness: THREE.Texture;
  concreteSidewalkColor: THREE.Texture;
  concreteSidewalkNormal: THREE.Texture;
  concreteSidewalkRoughness: THREE.Texture;
  concreteWallColor: THREE.Texture;
  concreteWallNormal: THREE.Texture;
  concreteWallRoughness: THREE.Texture;
  treeBillboard: THREE.Texture;
};

function prepareTexture(texture: THREE.Texture, repeat: [number, number], colorSpace: THREE.ColorSpace) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;
  texture.colorSpace = colorSpace;
  texture.needsUpdate = true;
  return texture;
}

function clonePreparedTexture(texture: THREE.Texture, repeat: [number, number], colorSpace: THREE.ColorSpace) {
  return prepareTexture(texture.clone(), repeat, colorSpace);
}

export function useWorldAssets(): WorldAssets {
  const [
    brickColor,
    brickNormal,
    brickRoughness,
    concreteColor,
    concreteNormal,
    concreteRoughness,
    asphaltColor,
    asphaltNormal,
    asphaltRoughness,
    treeBillboard
  ] = useLoader(THREE.TextureLoader, [
    "/textures/ambientcg/bricks051/Bricks051_1K-PNG_Color.png",
    "/textures/ambientcg/bricks051/Bricks051_1K-PNG_NormalGL.png",
    "/textures/ambientcg/bricks051/Bricks051_1K-PNG_Roughness.png",
    "/textures/ambientcg/concrete039/Concrete039_1K-PNG_Color.png",
    "/textures/ambientcg/concrete039/Concrete039_1K-PNG_NormalGL.png",
    "/textures/ambientcg/concrete039/Concrete039_1K-PNG_Roughness.png",
    "/textures/ambientcg/asphalt010/Asphalt010_1K-PNG_Color.png",
    "/textures/ambientcg/asphalt010/Asphalt010_1K-PNG_NormalGL.png",
    "/textures/ambientcg/asphalt010/Asphalt010_1K-PNG_Roughness.png",
    "/trees/tree-billboard.png"
  ]);

  const textures = useMemo(
    () => ({
      brickFacadeColor: clonePreparedTexture(brickColor, [1.8, 1.8], THREE.SRGBColorSpace),
      brickFacadeNormal: clonePreparedTexture(brickNormal, [1.8, 1.8], THREE.NoColorSpace),
      brickFacadeRoughness: clonePreparedTexture(brickRoughness, [1.8, 1.8], THREE.NoColorSpace),
      concreteSidewalkColor: clonePreparedTexture(concreteColor, [4.6, 18], THREE.SRGBColorSpace),
      concreteSidewalkNormal: clonePreparedTexture(concreteNormal, [4.6, 18], THREE.NoColorSpace),
      concreteSidewalkRoughness: clonePreparedTexture(concreteRoughness, [4.6, 18], THREE.NoColorSpace),
      concreteWallColor: clonePreparedTexture(concreteColor, [2.2, 2.2], THREE.SRGBColorSpace),
      concreteWallNormal: clonePreparedTexture(concreteNormal, [2.2, 2.2], THREE.NoColorSpace),
      concreteWallRoughness: clonePreparedTexture(concreteRoughness, [2.2, 2.2], THREE.NoColorSpace),
      asphaltRoadColor: clonePreparedTexture(asphaltColor, [6.8, 22], THREE.SRGBColorSpace),
      asphaltRoadNormal: clonePreparedTexture(asphaltNormal, [6.8, 22], THREE.NoColorSpace),
      asphaltRoadRoughness: clonePreparedTexture(asphaltRoughness, [6.8, 22], THREE.NoColorSpace),
      asphaltFloorColor: clonePreparedTexture(asphaltColor, [4.2, 8.2], THREE.SRGBColorSpace),
      asphaltFloorNormal: clonePreparedTexture(asphaltNormal, [4.2, 8.2], THREE.NoColorSpace),
      asphaltFloorRoughness: clonePreparedTexture(asphaltRoughness, [4.2, 8.2], THREE.NoColorSpace),
      treeBillboard: prepareTexture(treeBillboard.clone(), [1, 1], THREE.SRGBColorSpace)
    }),
    [asphaltColor, asphaltNormal, asphaltRoughness, brickColor, brickNormal, brickRoughness, concreteColor, concreteNormal, concreteRoughness, treeBillboard]
  );

  useEffect(() => {
    textures.treeBillboard.needsUpdate = true;

    return () => {
      Object.values(textures).forEach((texture) => texture.dispose());
    };
  }, [textures]);

  return textures;
}
