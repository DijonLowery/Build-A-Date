"use client";

import type { CSSProperties } from "react";

type PetalOverlayProps = {
  count?: number;
  variant?: "title" | "transition";
};

const petalSeed = [
  { left: "8%", top: "10%", driftX: "20vw", driftY: "44vh", duration: "12.6s", delay: "-2.2s", scale: "0.72", rotate: "-18deg" },
  { left: "18%", top: "22%", driftX: "28vw", driftY: "48vh", duration: "13.8s", delay: "-6.4s", scale: "0.96", rotate: "24deg" },
  { left: "28%", top: "14%", driftX: "18vw", driftY: "40vh", duration: "11.2s", delay: "-5.1s", scale: "0.84", rotate: "-8deg" },
  { left: "38%", top: "8%", driftX: "26vw", driftY: "52vh", duration: "14.3s", delay: "-7.8s", scale: "1.08", rotate: "18deg" },
  { left: "54%", top: "16%", driftX: "16vw", driftY: "46vh", duration: "12.2s", delay: "-3.5s", scale: "0.76", rotate: "-28deg" },
  { left: "66%", top: "12%", driftX: "14vw", driftY: "38vh", duration: "10.9s", delay: "-8.9s", scale: "0.92", rotate: "12deg" },
  { left: "74%", top: "20%", driftX: "10vw", driftY: "42vh", duration: "11.8s", delay: "-4.3s", scale: "0.82", rotate: "-10deg" },
  { left: "82%", top: "14%", driftX: "8vw", driftY: "34vh", duration: "10.2s", delay: "-6.2s", scale: "0.68", rotate: "16deg" },
  { left: "12%", top: "36%", driftX: "34vw", driftY: "30vh", duration: "12.9s", delay: "-9.1s", scale: "1.02", rotate: "8deg" },
  { left: "24%", top: "40%", driftX: "22vw", driftY: "36vh", duration: "13.5s", delay: "-4.8s", scale: "0.9", rotate: "-20deg" },
  { left: "60%", top: "34%", driftX: "14vw", driftY: "32vh", duration: "11.4s", delay: "-2.9s", scale: "0.78", rotate: "18deg" },
  { left: "78%", top: "42%", driftX: "10vw", driftY: "28vh", duration: "12.1s", delay: "-6.6s", scale: "0.94", rotate: "-12deg" }
] as const;

export function PetalOverlay({ count = 12, variant = "title" }: PetalOverlayProps) {
  return (
    <div className={`petal-overlay petal-overlay-${variant}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        const seed = petalSeed[index % petalSeed.length];

        return (
          <span
            className="petal"
            key={`${variant}-${index}`}
            style={
              {
                "--petal-delay": seed.delay,
                "--petal-duration": seed.duration,
                "--petal-drift-x": seed.driftX,
                "--petal-drift-y": seed.driftY,
                "--petal-left": seed.left,
                "--petal-rotate": seed.rotate,
                "--petal-scale": seed.scale,
                "--petal-top": seed.top
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
