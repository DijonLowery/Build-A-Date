"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { SafeSceneText } from "@/components/world/SafeSceneText";
import { boardPosition } from "@/lib/routeConfig";

type DateBoardProps = {
  active: boolean;
  onOpen: () => void;
  selectedLabel?: string | null;
};

export function DateBoard({ active: _active, onOpen: _onOpen, selectedLabel }: DateBoardProps) {
  const { size } = useThree();
  const isPhonePortrait = size.width <= 560 && size.height > size.width;
  const mobileTitleTexture = useMemo(() => {
    if (!isPhonePortrait) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 768;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(14, 19, 28, 0.98)";
    context.fillRect(120, 112, 784, 438);
    context.fillStyle = "rgba(88, 151, 214, 0.18)";
    context.fillRect(152, 144, 720, 374);
    context.fillStyle = "rgba(248, 227, 189, 0.98)";
    context.fillRect(184, 168, 656, 84);
    context.fillStyle = "rgba(255, 240, 224, 0.82)";
    context.fillRect(236, 288, 552, 34);
    context.fillStyle = "rgba(255, 216, 164, 0.9)";
    context.fillRect(236, 374, 552, 8);
    context.fillRect(236, 444, 552, 8);
    context.fillStyle = "rgba(255, 240, 224, 1)";
    context.textAlign = "center";
    context.font = "700 76px Georgia";
    context.fillText("PICK THE NIGHT", canvas.width / 2, 226);
    context.font = "600 38px Avenir Next";
    context.fillText("MAIN STREET BOARD", canvas.width / 2, 316);
    context.font = "500 34px Avenir Next";
    context.fillText("Tap the button below to open the weekends.", canvas.width / 2, 428);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }, [isPhonePortrait]);

  const mobileSelectedTexture = useMemo(() => {
    if (!isPhonePortrait || !selectedLabel) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 215, 166, 1)";
    context.textAlign = "center";
    context.font = "700 62px Avenir Next";
    context.fillText(selectedLabel.toUpperCase(), canvas.width / 2, 156);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }, [isPhonePortrait, selectedLabel]);

  return (
    <group position={boardPosition} scale={isPhonePortrait ? 0.98 : 0.64}>
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

        <mesh position={[0, 0.04, 0.12]} scale={[1.08, 1.28, 0.08]}>
          <capsuleGeometry args={[0.86, 1.32, 12, 20]} />
          <meshStandardMaterial color="#20344a" emissive="#5b9be1" emissiveIntensity={0.7} roughness={0.24} />
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

        {isPhonePortrait && mobileTitleTexture ? (
          <mesh position={[0, 0.9, 0.2]}>
            <planeGeometry args={[1.7, 1.28]} />
            <meshBasicMaterial map={mobileTitleTexture} transparent />
          </mesh>
        ) : (
          <>
            <SafeSceneText
              color="#fff5e8"
              fontSize={0.125}
              letterSpacing={0.14}
              outlineColor="#09111a"
              outlineWidth={0.006}
              position={[0, 1.06, 0.2]}
              textAlign="center"
            >
              PICK THE NIGHT
            </SafeSceneText>
            <SafeSceneText
              color="#fff3e0"
              fontSize={0.06}
              letterSpacing={0.16}
              outlineColor="#0d1620"
              outlineWidth={0.004}
              position={[0, 0.78, 0.2]}
              textAlign="center"
            >
              MAIN STREET BOARD
            </SafeSceneText>
          </>
        )}

        {isPhonePortrait && mobileSelectedTexture ? (
          <mesh position={[0, -0.94, 0.2]}>
            <planeGeometry args={[1.62, 0.48]} />
            <meshBasicMaterial map={mobileSelectedTexture} transparent />
          </mesh>
        ) : selectedLabel ? (
          <SafeSceneText
            color="#ffd7a6"
            fontSize={0.08}
            letterSpacing={0.09}
            outlineColor="#311917"
            outlineWidth={0.004}
            position={[0, -0.92, 0.2]}
            textAlign="center"
          >
            {selectedLabel.toUpperCase()}
          </SafeSceneText>
        ) : null}

        <pointLight color="#86c7ff" distance={7.4} intensity={0.92} position={[0, 1.2, 1]} />
        <pointLight color="#ffbd72" distance={5.8} intensity={0.42} position={[-0.72, 1.28, 0.78]} />
      </group>
    </group>
  );
}
