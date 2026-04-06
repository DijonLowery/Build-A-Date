"use client";

import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type ScenicPlateProps = {
  opacity?: number;
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  toneMapped?: boolean;
};

export function ScenicPlate({
  opacity = 1,
  path,
  position,
  rotation = [0, 0, 0],
  scale,
  toneMapped = false
}: ScenicPlateProps) {
  const texture = useTexture(path);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} opacity={opacity} toneMapped={toneMapped} transparent />
    </mesh>
  );
}
