"use client";

import { useEffect, useState } from "react";
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

const ASSET_PATHS = {
  asphaltColor: "/textures/ambientcg/asphalt010/Asphalt010_1K-PNG_Color.png",
  asphaltNormal: "/textures/ambientcg/asphalt010/Asphalt010_1K-PNG_NormalGL.png",
  asphaltRoughness: "/textures/ambientcg/asphalt010/Asphalt010_1K-PNG_Roughness.png",
  brickColor: "/textures/ambientcg/bricks051/Bricks051_1K-PNG_Color.png",
  brickNormal: "/textures/ambientcg/bricks051/Bricks051_1K-PNG_NormalGL.png",
  brickRoughness: "/textures/ambientcg/bricks051/Bricks051_1K-PNG_Roughness.png",
  concreteColor: "/textures/ambientcg/concrete039/Concrete039_1K-PNG_Color.png",
  concreteNormal: "/textures/ambientcg/concrete039/Concrete039_1K-PNG_NormalGL.png",
  concreteRoughness: "/textures/ambientcg/concrete039/Concrete039_1K-PNG_Roughness.png",
  treeBillboard: "/trees/tree-billboard.png"
} as const;

const listeners = new Set<() => void>();
let assetsCache: WorldAssets | null = null;
let assetsPromise: Promise<void> | null = null;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized;

  return {
    b: Number.parseInt(value.slice(4, 6), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    r: Number.parseInt(value.slice(0, 2), 16)
  };
}

function createSolidTexture(hex: string, colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace) {
  const { r, g, b } = hexToRgb(hex);
  const data = new Uint8Array([r, g, b, 255]);
  const texture = new THREE.DataTexture(data, 1, 1);
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createNormalTexture() {
  const data = new Uint8Array([128, 128, 255, 255]);
  const texture = new THREE.DataTexture(data, 1, 1);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function configureTexture(
  texture: THREE.Texture,
  {
    color = false,
    repeat = [1, 1],
    transparent = false
  }: {
    color?: boolean;
    repeat?: [number, number];
    transparent?: boolean;
  }
) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  if (transparent) {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }

  return texture;
}

function cloneConfigured(
  texture: THREE.Texture,
  options: {
    color?: boolean;
    repeat?: [number, number];
    transparent?: boolean;
  }
) {
  return configureTexture(texture.clone(), options);
}

function createFallbackAssets(): WorldAssets {
  return {
    asphaltFloorColor: configureTexture(createSolidTexture("#46373b"), { color: true, repeat: [5, 5] }),
    asphaltFloorNormal: configureTexture(createNormalTexture(), { repeat: [5, 5] }),
    asphaltFloorRoughness: configureTexture(createSolidTexture("#8a8a8a", THREE.NoColorSpace), { repeat: [5, 5] }),
    asphaltRoadColor: configureTexture(createSolidTexture("#403137"), { color: true, repeat: [6, 24] }),
    asphaltRoadNormal: configureTexture(createNormalTexture(), { repeat: [6, 24] }),
    asphaltRoadRoughness: configureTexture(createSolidTexture("#7b7b7b", THREE.NoColorSpace), { repeat: [6, 24] }),
    brickFacadeColor: configureTexture(createSolidTexture("#6d5147"), { color: true, repeat: [2.4, 2] }),
    brickFacadeNormal: configureTexture(createNormalTexture(), { repeat: [2.4, 2] }),
    brickFacadeRoughness: configureTexture(createSolidTexture("#9c9c9c", THREE.NoColorSpace), { repeat: [2.4, 2] }),
    concreteSidewalkColor: configureTexture(createSolidTexture("#b4aead"), { color: true, repeat: [4, 12] }),
    concreteSidewalkNormal: configureTexture(createNormalTexture(), { repeat: [4, 12] }),
    concreteSidewalkRoughness: configureTexture(createSolidTexture("#c8c8c8", THREE.NoColorSpace), { repeat: [4, 12] }),
    concreteWallColor: configureTexture(createSolidTexture("#898283"), { color: true, repeat: [2.4, 2.2] }),
    concreteWallNormal: configureTexture(createNormalTexture(), { repeat: [2.4, 2.2] }),
    concreteWallRoughness: configureTexture(createSolidTexture("#bdbdbd", THREE.NoColorSpace), { repeat: [2.4, 2.2] }),
    treeBillboard: configureTexture(createSolidTexture("#ffcee8"), {
      color: true,
      repeat: [1, 1],
      transparent: true
    })
  };
}

const fallbackAssets = createFallbackAssets();

function loadTexture(loader: THREE.TextureLoader, path: string) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });
}

async function buildAssets() {
  const loader = new THREE.TextureLoader();

  const [
    asphaltColor,
    asphaltNormal,
    asphaltRoughness,
    brickColor,
    brickNormal,
    brickRoughness,
    concreteColor,
    concreteNormal,
    concreteRoughness,
    treeBillboard
  ] = await Promise.all([
    loadTexture(loader, ASSET_PATHS.asphaltColor),
    loadTexture(loader, ASSET_PATHS.asphaltNormal),
    loadTexture(loader, ASSET_PATHS.asphaltRoughness),
    loadTexture(loader, ASSET_PATHS.brickColor),
    loadTexture(loader, ASSET_PATHS.brickNormal),
    loadTexture(loader, ASSET_PATHS.brickRoughness),
    loadTexture(loader, ASSET_PATHS.concreteColor),
    loadTexture(loader, ASSET_PATHS.concreteNormal),
    loadTexture(loader, ASSET_PATHS.concreteRoughness),
    loadTexture(loader, ASSET_PATHS.treeBillboard)
  ]);

  assetsCache = {
    asphaltFloorColor: cloneConfigured(asphaltColor, { color: true, repeat: [5, 5] }),
    asphaltFloorNormal: cloneConfigured(asphaltNormal, { repeat: [5, 5] }),
    asphaltFloorRoughness: cloneConfigured(asphaltRoughness, { repeat: [5, 5] }),
    asphaltRoadColor: cloneConfigured(asphaltColor, { color: true, repeat: [6, 24] }),
    asphaltRoadNormal: cloneConfigured(asphaltNormal, { repeat: [6, 24] }),
    asphaltRoadRoughness: cloneConfigured(asphaltRoughness, { repeat: [6, 24] }),
    brickFacadeColor: cloneConfigured(brickColor, { color: true, repeat: [2.4, 2] }),
    brickFacadeNormal: cloneConfigured(brickNormal, { repeat: [2.4, 2] }),
    brickFacadeRoughness: cloneConfigured(brickRoughness, { repeat: [2.4, 2] }),
    concreteSidewalkColor: cloneConfigured(concreteColor, { color: true, repeat: [4, 12] }),
    concreteSidewalkNormal: cloneConfigured(concreteNormal, { repeat: [4, 12] }),
    concreteSidewalkRoughness: cloneConfigured(concreteRoughness, { repeat: [4, 12] }),
    concreteWallColor: cloneConfigured(concreteColor, { color: true, repeat: [2.4, 2.2] }),
    concreteWallNormal: cloneConfigured(concreteNormal, { repeat: [2.4, 2.2] }),
    concreteWallRoughness: cloneConfigured(concreteRoughness, { repeat: [2.4, 2.2] }),
    treeBillboard: cloneConfigured(treeBillboard, { color: true, transparent: true })
  };
}

function ensureAssetsLoading() {
  if (assetsCache || assetsPromise) {
    return;
  }

  assetsPromise = buildAssets()
    .catch((error) => {
      console.error("Failed to load world textures.", error);
    })
    .finally(() => {
      assetsPromise = null;
      notifyListeners();
    });
}

export function useWorldAssets() {
  const [assets, setAssets] = useState<WorldAssets>(assetsCache ?? fallbackAssets);

  useEffect(() => {
    function handleUpdate() {
      setAssets(assetsCache ?? fallbackAssets);
    }

    listeners.add(handleUpdate);
    handleUpdate();
    ensureAssetsLoading();

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return assets;
}
