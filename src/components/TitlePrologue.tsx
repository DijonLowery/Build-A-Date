"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "@/store";

/* ------------------------------------------------------------------ */
/*  Falling petals — client-only to avoid hydration mismatch           */
/* ------------------------------------------------------------------ */
function FallingPetals({ count = 55 }: { count?: number }) {
  const [petals, setPetals] = useState<{ id: number; left: number; delay: number; dur: number; size: number; opacity: number }[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 110 - 5,
        delay: Math.random() * 12,
        dur: 5 + Math.random() * 9,
        size: 6 + Math.random() * 16,
        opacity: 0.5 + Math.random() * 0.45,
      }))
    );
  }, [count]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 15, overflow: "hidden" }}>
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-15px",
            width: p.size,
            height: p.size * 0.6,
            background: `radial-gradient(ellipse, rgba(255,185,200,${p.opacity}), rgba(255,155,175,${p.opacity * 0.35}))`,
            borderRadius: "50% 50% 50% 10%",
            animation: `petalFall ${p.dur}s ${p.delay}s infinite ease-in-out`,
            filter: "blur(0.3px)",
            boxShadow: `0 0 ${p.size / 3}px rgba(255,180,200,0.15)`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Swimming koi fish                                                  */
/* ------------------------------------------------------------------ */
function KoiFish() {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
      pointerEvents: "none", zIndex: 12, overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "35%", left: "25%", animation: "koiSwim 14s infinite ease-in-out" }}>
        <svg width="52" height="22" viewBox="0 0 52 22" style={{ opacity: 0.4 }}>
          <ellipse cx="24" cy="11" rx="18" ry="7" fill="url(#k1g)" />
          <path d="M42,11 Q48,5 51,2 Q46,11 51,20 Q48,17 42,11Z" fill="rgba(255,120,40,0.4)" />
          <ellipse cx="8" cy="11" rx="7" ry="5.5" fill="rgba(255,160,80,0.4)" />
          <circle cx="6" cy="10" r="1.2" fill="rgba(20,10,5,0.45)" />
          <ellipse cx="20" cy="9" rx="5" ry="2.5" fill="rgba(255,255,240,0.12)" />
          <defs>
            <linearGradient id="k1g" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,150,60,0.45)" />
              <stop offset="100%" stopColor="rgba(220,90,30,0.3)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div style={{ position: "absolute", top: "55%", left: "55%", animation: "koiSwim2 17s 3s infinite ease-in-out" }}>
        <svg width="42" height="18" viewBox="0 0 42 18" style={{ opacity: 0.3 }}>
          <ellipse cx="19" cy="9" rx="15" ry="6" fill="rgba(255,235,225,0.3)" />
          <path d="M34,9 Q39,4 41,1 Q37,9 41,17 Q39,14 34,9Z" fill="rgba(255,210,190,0.25)" />
          <circle cx="6" cy="8" r="1" fill="rgba(20,10,5,0.35)" />
          <ellipse cx="16" cy="7" rx="5" ry="2" fill="rgba(200,40,30,0.18)" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: "22%", left: "48%", animation: "koiSwim 20s 7s infinite ease-in-out", transform: "scaleX(-1)" }}>
        <svg width="36" height="16" viewBox="0 0 36 16" style={{ opacity: 0.22 }}>
          <ellipse cx="16" cy="8" rx="13" ry="5" fill="rgba(255,170,70,0.3)" />
          <path d="M29,8 Q33,4 35,1 Q32,8 35,15 Q33,12 29,8Z" fill="rgba(255,150,50,0.2)" />
          <circle cx="5" cy="7" r="0.8" fill="rgba(20,10,5,0.3)" />
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Title Prologue                                                */
/* ------------------------------------------------------------------ */
export default function TitlePrologue() {
  const { setMode } = useStore();

  const handleBegin = () => {
    setMode("transition");
    setTimeout(() => setMode("instructions"), 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
      {/* Hyperrealistic garden background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/title-prologue/reference.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }} />

      {/* Subtle vignette for text readability */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 5,
        background: "radial-gradient(ellipse at center 42%, transparent 25%, rgba(0,0,0,0.3) 100%)",
      }} />

      {/* Animated falling petals (fewer on mobile for performance) */}
      <FallingPetals count={typeof window !== "undefined" && window.innerWidth < 768 ? 22 : 55} />

      {/* Animated koi fish in the water */}
      <KoiFish />

      {/* Title text + button
          NOTE: content starts visible (opacity 1) so iOS Safari renders it
          even if framer-motion animations stall on slow devices. Animations
          below are fade/slide enhancements, not prerequisites. */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 28px",
        // Respect safe areas (iPhone notch / home indicator)
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        <motion.h1
          initial={false}
          animate={{ opacity: [0, 1], y: [20, 0] }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{
            opacity: 1,
            fontSize: "clamp(38px, 10vw, 54px)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400, color: "#fdf5e6",
            marginBottom: 0, lineHeight: 1.1,
            textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.4), 0 0 10px rgba(0,0,0,0.9)",
            letterSpacing: "0.01em",
            textAlign: "center",
          }}
        >
          Build-A-Date
        </motion.h1>

        <motion.p
          initial={false}
          animate={{ opacity: [0, 1], y: [15, 0] }}
          transition={{ duration: 1.2, delay: 1.2 }}
          style={{
            opacity: 1,
            fontSize: "clamp(28px, 8vw, 42px)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700, color: "#fdf5e6",
            marginBottom: 18, lineHeight: 1.2,
            textShadow: "0 2px 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.4), 0 0 10px rgba(0,0,0,0.9)",
            textAlign: "center",
          }}
        >
          Madison&hellip;
        </motion.p>

        <motion.div
          initial={false}
          animate={{ opacity: [0, 1], y: [15, 0] }}
          transition={{ duration: 1.2, delay: 2 }}
          style={{ opacity: 1, marginBottom: 26, textAlign: "center" }}
        >
          {[
            "I know life stays busy,",
            "so I planned this with intention.",
            "Let\u2019s build your perfect night.",
          ].map((line, i) => (
            <p key={i} style={{
              fontSize: "clamp(13px, 3.8vw, 17px)",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontWeight: 300,
              color: i === 2 ? "rgba(255,240,230,0.9)" : "rgba(255,240,230,0.7)",
              letterSpacing: "0.04em", lineHeight: 1.8,
              textShadow: "0 1px 15px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.9)",
              marginTop: i === 2 ? 6 : 0,
            }}>
              {line}
            </p>
          ))}
        </motion.div>

        <motion.button
          initial={false}
          animate={{ opacity: [0, 1], y: [10, 0] }}
          transition={{ duration: 1, delay: 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBegin}
          style={{
            opacity: 1,
            padding: "14px 40px", borderRadius: 50, cursor: "pointer",
            background: "linear-gradient(135deg, rgba(18,15,12,0.85), rgba(12,10,8,0.9))",
            border: "1px solid rgba(255,220,200,0.2)",
            WebkitBackdropFilter: "blur(12px)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,220,200,0.06)",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{
            fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" as const,
            fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500,
            color: "rgba(255,230,210,0.85)",
          }}>
            Begin the Night
          </span>
        </motion.button>
      </div>
    </div>
  );
}
