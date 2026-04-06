"use client";

import { Text } from "@react-three/drei";

import { activityFocusPosition } from "@/lib/routeConfig";

type ActivityCueProps = {
  active: boolean;
  onOpen: () => void;
  selectedLabel?: string | null;
};

export function ActivityCue({ active, onOpen, selectedLabel }: ActivityCueProps) {
  return (
    <group onClick={active ? onOpen : undefined} position={[activityFocusPosition[0] + 5.2, activityFocusPosition[1] - 0.42, activityFocusPosition[2] + 4.2]}>
      <mesh position={[0, -0.3, -0.16]} scale={[1.1, 0.1, 0.54]}>
        <capsuleGeometry args={[0.62, 1.1, 12, 20]} />
        <meshStandardMaterial color="#1a1f2c" roughness={0.64} />
      </mesh>
      <mesh position={[0, 0.12, 0.08]} scale={[0.96, 0.26, 0.12]}>
        <capsuleGeometry args={[0.42, 0.82, 12, 20]} />
        <meshStandardMaterial color="#2b4672" emissive="#5d86b8" emissiveIntensity={active ? 0.74 : 0.32} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.36, 0.14]}>
        <planeGeometry args={[1.22, 0.22]} />
        <meshBasicMaterial color="#f5f8ff" opacity={0.82} transparent />
      </mesh>
      <mesh position={[0, 0.62, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.035, 10, 36]} />
        <meshBasicMaterial color="#98c5ff" opacity={active ? 0.22 : 0.12} transparent />
      </mesh>

      <Text color="#f7f9ff" fontSize={0.084} letterSpacing={0.14} position={[0, 0.38, 0.18]} textAlign="center">
        NIGHTLIFE DISTRICT
      </Text>

      {selectedLabel ? (
        <Text color="#b9d2ff" fontSize={0.068} maxWidth={1.56} position={[0, -0.4, 0.18]} textAlign="center">
          {selectedLabel}
        </Text>
      ) : null}

      <pointLight color="#8fbcff" distance={7.6} intensity={active ? 1.18 : 0.66} position={[0, 1.32, 0.84]} />
    </group>
  );
}
