"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

type SurfaceMaps = {
  metalnessMap: THREE.CanvasTexture;
  stoneNormalMap: THREE.CanvasTexture;
  stoneRoughnessMap: THREE.CanvasTexture;
  wetTileNormalMap: THREE.CanvasTexture;
  wetTileRoughnessMap: THREE.CanvasTexture;
  woodNormalMap: THREE.CanvasTexture;
  woodRoughnessMap: THREE.CanvasTexture;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function fract(value: number) {
  return value - Math.floor(value);
}

function hash2d(x: number, y: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function smoothNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;

  const a = hash2d(x0, y0);
  const b = hash2d(x0 + 1, y0);
  const c = hash2d(x0, y0 + 1);
  const d = hash2d(x0 + 1, y0 + 1);

  const ux = tx * tx * (3 - 2 * tx);
  const uy = ty * ty * (3 - 2 * ty);

  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, ux), THREE.MathUtils.lerp(c, d, ux), uy);
}

function finalizeTexture(texture: THREE.CanvasTexture, repeatX: number, repeatY: number) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createDataTexture(size: number, repeatX: number, repeatY: number, fill: (x: number, y: number, data: Uint8ClampedArray, index: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create texture canvas context.");
  }

  const image = context.createImageData(size, size);
  const { data } = image;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      fill(x, y, data, (y * size + x) * 4);
    }
  }

  context.putImageData(image, 0, 0);
  return finalizeTexture(new THREE.CanvasTexture(canvas), repeatX, repeatY);
}

function createWetTileHeight(size: number) {
  const values = new Float32Array(size * size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const gridU = u * 10;
      const gridV = v * 18;
      const seamU = Math.min(fract(gridU), 1 - fract(gridU));
      const seamV = Math.min(fract(gridV), 1 - fract(gridV));
      const seam = Math.min(seamU, seamV);
      const seamDepth = clamp01(1 - seam * 16);
      const puddle = smoothNoise(u * 12, v * 20) * 0.35 + smoothNoise(u * 28 + 4, v * 22 + 8) * 0.18;
      const base = 0.44 + puddle * 0.38 - seamDepth * 0.24;
      values[y * size + x] = clamp01(base);
    }
  }

  return values;
}

function createWoodHeight(size: number) {
  const values = new Float32Array(size * size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const plank = fract(u * 7);
      const grain =
        Math.sin(u * 68 + smoothNoise(u * 8, v * 10) * 4) * 0.08 +
        Math.sin(u * 132 + v * 6) * 0.04 +
        smoothNoise(u * 18, v * 14) * 0.09;
      const seam = clamp01(1 - Math.min(plank, 1 - plank) * 22);
      const base = 0.48 + grain - seam * 0.18;
      values[y * size + x] = clamp01(base);
    }
  }

  return values;
}

function createStoneHeight(size: number) {
  const values = new Float32Array(size * size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const base = smoothNoise(u * 14, v * 14) * 0.32 + smoothNoise(u * 42 + 3, v * 42 + 6) * 0.12;
      const chips = clamp01(1 - Math.abs(smoothNoise(u * 70 + 1.2, v * 70 + 7.4) - 0.5) * 4) * 0.08;
      values[y * size + x] = clamp01(0.5 + base + chips);
    }
  }

  return values;
}

function createNormalMap(height: Float32Array, size: number, repeatX: number, repeatY: number, strength: number) {
  return createDataTexture(size, repeatX, repeatY, (x, y, data, index) => {
    const xPrev = (x - 1 + size) % size;
    const xNext = (x + 1) % size;
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;

    const left = height[y * size + xPrev];
    const right = height[y * size + xNext];
    const down = height[yPrev * size + x];
    const up = height[yNext * size + x];

    const dx = (left - right) * strength;
    const dy = (down - up) * strength;
    const vector = new THREE.Vector3(dx, dy, 1).normalize();

    data[index] = Math.round((vector.x * 0.5 + 0.5) * 255);
    data[index + 1] = Math.round((vector.y * 0.5 + 0.5) * 255);
    data[index + 2] = Math.round((vector.z * 0.5 + 0.5) * 255);
    data[index + 3] = 255;
  });
}

function createRoughnessMap(height: Float32Array, size: number, repeatX: number, repeatY: number, wetness: number) {
  return createDataTexture(size, repeatX, repeatY, (x, y, data, index) => {
    const h = height[y * size + x];
    const gloss = clamp01(1 - h * wetness);
    const roughness = clamp01(0.24 + gloss * 0.72);
    const value = Math.round(roughness * 255);
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  });
}

function createMetalnessMap(size: number) {
  return createDataTexture(size, 3, 3, (x, y, data, index) => {
    const u = x / size;
    const v = y / size;
    const brushed = smoothNoise(u * 34, v * 8) * 0.36 + smoothNoise(u * 70 + 12, v * 16) * 0.18;
    const metalness = clamp01(0.54 + brushed * 0.34);
    const value = Math.round(metalness * 255);
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  });
}

function buildMaps(): SurfaceMaps {
  const size = 256;
  const wetTileHeight = createWetTileHeight(size);
  const woodHeight = createWoodHeight(size);
  const stoneHeight = createStoneHeight(size);

  return {
    metalnessMap: createMetalnessMap(size),
    stoneNormalMap: createNormalMap(stoneHeight, size, 6, 6, 5.4),
    stoneRoughnessMap: createRoughnessMap(stoneHeight, size, 6, 6, 0.62),
    wetTileNormalMap: createNormalMap(wetTileHeight, size, 7, 14, 6.2),
    wetTileRoughnessMap: createRoughnessMap(wetTileHeight, size, 7, 14, 0.92),
    woodNormalMap: createNormalMap(woodHeight, size, 5, 5, 4.8),
    woodRoughnessMap: createRoughnessMap(woodHeight, size, 5, 5, 0.56)
  };
}

export function useSurfaceMaps() {
  const maps = useMemo(buildMaps, []);

  useEffect(() => {
    return () => {
      Object.values(maps).forEach((texture) => texture.dispose());
    };
  }, [maps]);

  return maps;
}
