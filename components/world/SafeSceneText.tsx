"use client";

import type { ComponentProps } from "react";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function SafeSceneText(props: ComponentProps<typeof Text>) {
  const { size } = useThree();
  const isPhonePortrait = size.width <= 560 && size.height > size.width;

  if (isPhonePortrait) {
    return null;
  }

  return <Text {...props} />;
}
