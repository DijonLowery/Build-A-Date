"use client";

import { PetalOverlay } from "@/components/title/PetalOverlay";
import { TitleCopy } from "@/components/title/TitleCopy";
import { TitleHeroImage } from "@/components/title/TitleHeroImage";

type TitlePrologueProps = {
  onBegin: () => void;
  preparing?: boolean;
};

export function TitlePrologue({ onBegin, preparing = false }: TitlePrologueProps) {
  return (
    <section className="title-prologue" aria-label="Build-A-Date title prologue">
      <div className="title-backdrop" aria-hidden="true">
        <TitleHeroImage className="title-hero-image-backdrop" />
      </div>

      <div className="title-frame">
        <div className="title-scene-plate" aria-hidden="true">
          <TitleHeroImage className="title-hero-image-frame" />
          <PetalOverlay count={10} variant="title" />
        </div>

        <div className="title-scene-vignette" />
        <TitleCopy onBegin={onBegin} preparing={preparing} />
        <div className="title-foreground-haze" aria-hidden="true" />
        <PetalOverlay count={6} variant="title" />
      </div>
    </section>
  );
}
