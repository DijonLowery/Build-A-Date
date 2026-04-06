"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type BillboardTreeProps = {
  glowColor?: string;
  glowIntensity?: number;
  map: THREE.Texture;
  position: [number, number, number];
  scale?: number;
  tint?: string;
};

export function BillboardTree({
  glowColor = "#ffcda7",
  glowIntensity = 0,
  map,
  position,
  scale = 1,
  tint = "#ffffff"
}: BillboardTreeProps) {
  const spriteCenter = useMemo(() => new THREE.Vector2(0.5, 0), []);
  const spriteMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        alphaTest: 0.16,
        color: new THREE.Color(tint),
        depthWrite: false,
        map,
        transparent: true
      }),
    [map, tint]
  );

  useEffect(() => {
    return () => {
      spriteMaterial.dispose();
    };
  }, [spriteMaterial]);

  useFrame(({ camera }, delta) => {
    spriteMaterial.rotation = THREE.MathUtils.damp(spriteMaterial.rotation, (camera.rotation.z || 0) * 0.04, 4, delta);
  });

  return (
    <group position={position}>
      {glowIntensity > 0 ? <pointLight color={glowColor} distance={8 * scale} intensity={glowIntensity} position={[0, 2.4 * scale, 0.4]} /> : null}
      <sprite center={spriteCenter} material={spriteMaterial} position={[0, 0.05, 0]} scale={[3.4 * scale, 4.6 * scale, 1]} />
    </group>
  );
}
