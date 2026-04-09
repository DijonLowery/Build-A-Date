"use client";
import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export default function PetalOverlay({ count = 25 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 8,
        size: 8 + Math.random() * 14,
        opacity: 0.3 + Math.random() * 0.5,
      }))
    );
  }, [count]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size * 0.7,
            background: `radial-gradient(ellipse, rgba(255,183,197,${p.opacity}), rgba(255,154,172,${p.opacity * 0.5}))`,
            borderRadius: "50% 50% 50% 0%",
            animation: `petalFall ${p.duration}s ${p.delay}s infinite ease-in-out`,
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
}
