"use client";

import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { boardPosition } from "@/lib/routeConfig";

type DateBoardProps = {
  active: boolean;
  onOpen: () => void;
  selectedLabel?: string | null;
};

export function DateBoard({ active: _active, onOpen: _onOpen, selectedLabel }: DateBoardProps) {
  const { size } = useThree();
  const isPhonePortrait = size.width <= 560 && size.height > size.width;

  return (
    <group position={boardPosition} scale={isPhonePortrait ? 0.6 : 0.64}>
      <group rotation={[0, Math.PI, 0]}>
        <mesh castShadow position={[0, -1.4, 0]}>
          <capsuleGeometry args={[0.08, 2.62, 10, 18]} />
          <meshStandardMaterial color="#1d2129" metalness={0.22} roughness={0.64} />
        </mesh>

        <mesh castShadow position={[0.06, 1.74, -0.08]} scale={[1.18, 0.12, 0.54]}>
          <capsuleGeometry args={[0.84, 0.74, 10, 18]} />
          <meshStandardMaterial color="#1b2128" roughness={0.56} />
        </mesh>

        {[-0.96, 0.96].map((x) => (
          <mesh castShadow key={x} position={[x, 0.26, -0.22]}>
            <capsuleGeometry args={[0.055, 2.98, 8, 16]} />
            <meshStandardMaterial color="#1d2129" metalness={0.24} roughness={0.62} />
          </mesh>
        ))}

        <mesh castShadow scale={[1.22, 1.5, 0.18]}>
          <capsuleGeometry args={[0.98, 1.66, 12, 20]} />
          <meshStandardMaterial color="#10151d" metalness={0.2} roughness={0.46} />
        </mesh>

        <mesh position={[0, 0.04, 0.12]} scale={[1.04, 1.22, 0.08]}>
          <capsuleGeometry args={[0.86, 1.32, 12, 20]} />
          <meshStandardMaterial color="#1e2c3d" emissive="#4b83b7" emissiveIntensity={0.55} roughness={0.3} />
        </mesh>

        <mesh position={[0, 1.05, 0.17]}>
          <planeGeometry args={[1.56, 0.18]} />
          <meshBasicMaterial color="#f8e3bd" opacity={0.78} transparent />
        </mesh>
        <mesh position={[0, 0.74, 0.17]}>
          <planeGeometry args={[1.24, 0.08]} />
          <meshBasicMaterial color="#f7ede1" opacity={0.48} transparent />
        </mesh>

        {Array.from({ length: 6 }).map((_, index) => (
          <mesh key={index} position={[-0.52 + (index % 2) * 0.62, 0.14 - Math.floor(index / 2) * 0.5, 0.16]}>
            <circleGeometry args={[0.125, 18]} />
            <meshStandardMaterial color="#f5e8d3" emissive="#d9a360" emissiveIntensity={0.12} roughness={0.3} />
          </mesh>
        ))}

        <Text color="#fff5e8" fontSize={0.125} letterSpacing={0.14} position={[0, 1.06, 0.2]} textAlign="center">
          PICK THE NIGHT
        </Text>
        <Text color="#fff3e0" fontSize={0.06} letterSpacing={0.16} position={[0, 0.78, 0.2]} textAlign="center">
          MAIN STREET BOARD
        </Text>

        {selectedLabel ? (
          <Text color="#ffd7a6" fontSize={0.08} letterSpacing={0.09} position={[0, -0.92, 0.2]} textAlign="center">
            {selectedLabel.toUpperCase()}
          </Text>
        ) : null}

        <pointLight color="#86c7ff" distance={7.4} intensity={0.92} position={[0, 1.2, 1]} />
        <pointLight color="#ffbd72" distance={5.8} intensity={0.42} position={[-0.72, 1.28, 0.78]} />
      </group>
    </group>
  );
}
