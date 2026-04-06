"use client";

import { Text } from "@react-three/drei";

import { dinnerFocusPosition } from "@/lib/routeConfig";

type DinnerCueProps = {
  active: boolean;
  onOpen: () => void;
  selectedLabel?: string | null;
};

export function DinnerCue({ active, onOpen, selectedLabel }: DinnerCueProps) {
  return (
    <group onClick={active ? onOpen : undefined} position={dinnerFocusPosition}>
      <mesh position={[0, -0.32, -0.18]} scale={[0.9, 0.08, 0.4]}>
        <capsuleGeometry args={[0.56, 0.94, 12, 20]} />
        <meshStandardMaterial color="#2d1d1f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.04, 0.1]} scale={[0.8, 0.2, 0.1]}>
        <capsuleGeometry args={[0.4, 0.72, 12, 20]} />
        <meshStandardMaterial color="#56312d" emissive="#a75e4a" emissiveIntensity={active ? 0.52 : 0.28} roughness={0.44} />
      </mesh>
      <mesh position={[0, 0.2, 0.16]}>
        <planeGeometry args={[0.94, 0.14]} />
        <meshBasicMaterial color="#fff0dd" opacity={0.76} transparent />
      </mesh>
      <mesh position={[0, 0.48, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.03, 10, 36]} />
        <meshBasicMaterial color="#ffd6ab" opacity={active ? 0.22 : 0.1} transparent />
      </mesh>

      <Text color="#fff3e7" fontSize={0.074} letterSpacing={0.14} position={[0, 0.22, 0.2]} textAlign="center">
        DINNER DISTRICT
      </Text>

      {selectedLabel ? (
        <Text color="#ffd8a8" fontSize={0.062} maxWidth={1.34} position={[0, -0.42, 0.18]} textAlign="center">
          {selectedLabel}
        </Text>
      ) : null}

      <pointLight color="#ffbf79" distance={6.8} intensity={active ? 1 : 0.72} position={[0, 1.16, 0.7]} />
    </group>
  );
}
