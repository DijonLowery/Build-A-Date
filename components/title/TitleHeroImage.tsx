"use client";

import { useState } from "react";

type TitleHeroImageProps = {
  className?: string;
};

export function TitleHeroImage({ className }: TitleHeroImageProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <img
      alt=""
      className={["title-hero-image", className].filter(Boolean).join(" ")}
      decoding="async"
      fetchPriority="high"
      loading="eager"
      onError={() => setVisible(false)}
      src="/title-prologue/garden-clean.png"
    />
  );
}
