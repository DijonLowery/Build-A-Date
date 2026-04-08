"use client";

import { useEffect, useState } from "react";
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
  toneMapped = true
}: ScenicPlateProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();
    let loadedTexture: THREE.Texture | null = null;

    loader.load(
      path,
      (incomingTexture) => {
        if (disposed) {
          incomingTexture.dispose();
          return;
        }

        incomingTexture.colorSpace = THREE.SRGBColorSpace;
        incomingTexture.anisotropy = 12;
        incomingTexture.minFilter = THREE.LinearMipmapLinearFilter;
        incomingTexture.magFilter = THREE.LinearFilter;
        incomingTexture.needsUpdate = true;
        loadedTexture = incomingTexture;
        setTexture(incomingTexture);
      },
      undefined,
      () => {
        if (!disposed) {
          setTexture(null);
        }
      }
    );

    return () => {
      disposed = true;
      if (loadedTexture) {
        loadedTexture.dispose();
      }
    };
  }, [path]);

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      {texture ? (
        <meshBasicMaterial map={texture} opacity={opacity} toneMapped={toneMapped} transparent />
      ) : (
        <meshBasicMaterial color="#6d5668" opacity={opacity * 0.72} toneMapped={toneMapped} transparent />
      )}
    </mesh>
  );
}
