"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraRigProps {
  targetZ: number;
}

export default function CameraRig({ targetZ }: CameraRigProps) {
  const { camera } = useThree();
  const currentZ = useRef(8); // start position
  const swayTime = useRef(0);

  useFrame((_, delta) => {
    // Smooth follow
    currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ, delta * 0.8);
    swayTime.current += delta;

    // Gentle cinematic sway
    const swayX = Math.sin(swayTime.current * 0.25) * 0.12;
    const swayY = Math.sin(swayTime.current * 0.18) * 0.04;

    // Camera: behind the couple, elevated to see them + the city
    camera.position.set(
      1.0 + swayX,
      3.2 + swayY,
      currentZ.current + 7
    );

    // Look at couple center, slightly ahead
    camera.lookAt(
      0,
      1.2,
      currentZ.current - 2
    );
  });

  return null;
}
