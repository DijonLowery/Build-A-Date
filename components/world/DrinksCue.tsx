"use client";

import { Text } from "@react-three/drei";

import { drinksFocusPosition } from "@/lib/routeConfig";

type DrinksCueProps = {
  active: boolean;
  onOpen: () => void;
  selectedLabel?: string | null;
};

export function DrinksCue({ active, onOpen, selectedLabel }: DrinksCueProps) {
  return (
    <group
      onClick={active ? onOpen : undefined}
      position={[drinksFocusPosition[0] + 4.18, drinksFocusPosition[1] - 0.12, drinksFocusPosition[2] + 3.02]}
    >
      <mesh position={[0, -0.32, -0.18]} scale={[0.96, 0.1, 0.52]}>
        <capsuleGeometry args={[0.58, 0.98, 12, 20]} />
        <meshStandardMaterial color="#2a2122" roughness={0.66} />
      </mesh>
      <mesh position={[0, 0.08, 0.12]} scale={[0.86, 0.26, 0.12]}>
        <capsuleGeometry args={[0.42, 0.76, 12, 20]} />
        <meshStandardMaterial color="#6a4133" emissive="#c58b60" emissiveIntensity={active ? 0.58 : 0.24} roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.34, 0.16]}>
        <planeGeometry args={[1.02, 0.18]} />
        <meshBasicMaterial color="#fff3e2" opacity={0.84} transparent />
      </mesh>
      <mesh position={[0, 0.62, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.03, 10, 36]} />
        <meshBasicMaterial color="#ffd4a8" opacity={active ? 0.2 : 0.08} transparent />
      </mesh>

      <Text color="#fff5ea" fontSize={0.082} letterSpacing={0.14} position={[0, 0.34, 0.18]} textAlign="center">
        ROOFTOP FINALE
      </Text>
      <Text color="#ffd9ad" fontSize={0.06} maxWidth={1.56} position={[0, 0.62, 0.18]} textAlign="center">
        one more stop
      </Text>

      {selectedLabel ? (
        <Text color="#ffd9ad" fontSize={0.066} maxWidth={1.4} position={[0, -0.42, 0.18]} textAlign="center">
          {selectedLabel}
        </Text>
      ) : null}

      <pointLight color="#ffc892" distance={8.2} intensity={active ? 1.06 : 0.6} position={[0, 1.24, 0.84]} />
    </group>
  );
}
