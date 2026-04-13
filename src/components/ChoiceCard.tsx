"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Choice {
  name: string;
  label?: string;
  copy: string;
}

interface ChoiceCardProps {
  title: string;
  copy: string;
  choices: Choice[];
  confirmLabel: string;
  onSelect: (name: string) => void;
}

/* ── Ornamental SVG pieces ── */

function TopFlourish() {
  return (
    <svg
      width="220" height="24" viewBox="0 0 220 24"
      style={{ display: "block", margin: "-2px auto 0", overflow: "visible" }}
    >
      {/* Central rose bloom */}
      <g transform="translate(110,12)">
        {[0, 60, 120, 180, 240, 300].map((rot) => (
          <ellipse
            key={rot}
            cx="0" cy="-3" rx="2" ry="3.5"
            transform={`rotate(${rot})`}
            fill="none" stroke="rgba(240,196,140,0.4)" strokeWidth="0.5"
          />
        ))}
        <circle r="1.8" fill="rgba(240,196,140,0.15)" stroke="rgba(240,196,140,0.45)" strokeWidth="0.4" />
        <circle r="0.7" fill="rgba(240,196,140,0.35)" />
      </g>
      {/* Left vine */}
      <path
        d="M105,12 C95,12 85,8 70,9 C58,10 48,6 35,8 C25,9 18,7 8,10"
        fill="none" stroke="rgba(240,196,140,0.22)" strokeWidth="0.6"
      />
      <ellipse cx="70" cy="8" rx="4" ry="1.8" transform="rotate(-15,70,8)" fill="none" stroke="rgba(240,196,140,0.2)" strokeWidth="0.4" />
      <ellipse cx="48" cy="7" rx="3.5" ry="1.5" transform="rotate(10,48,7)" fill="none" stroke="rgba(240,196,140,0.17)" strokeWidth="0.4" />
      <ellipse cx="28" cy="8" rx="3" ry="1.3" transform="rotate(-8,28,8)" fill="none" stroke="rgba(240,196,140,0.14)" strokeWidth="0.4" />
      <circle cx="85" cy="9" r="1.2" fill="none" stroke="rgba(240,196,140,0.17)" strokeWidth="0.4" />
      <circle cx="58" cy="8" r="1" fill="none" stroke="rgba(240,196,140,0.14)" strokeWidth="0.3" />
      {/* Right vine — mirrored */}
      <path
        d="M115,12 C125,12 135,8 150,9 C162,10 172,6 185,8 C195,9 202,7 212,10"
        fill="none" stroke="rgba(240,196,140,0.22)" strokeWidth="0.6"
      />
      <ellipse cx="150" cy="8" rx="4" ry="1.8" transform="rotate(15,150,8)" fill="none" stroke="rgba(240,196,140,0.2)" strokeWidth="0.4" />
      <ellipse cx="172" cy="7" rx="3.5" ry="1.5" transform="rotate(-10,172,7)" fill="none" stroke="rgba(240,196,140,0.17)" strokeWidth="0.4" />
      <ellipse cx="192" cy="8" rx="3" ry="1.3" transform="rotate(8,192,8)" fill="none" stroke="rgba(240,196,140,0.14)" strokeWidth="0.4" />
      <circle cx="135" cy="9" r="1.2" fill="none" stroke="rgba(240,196,140,0.17)" strokeWidth="0.4" />
      <circle cx="162" cy="8" r="1" fill="none" stroke="rgba(240,196,140,0.14)" strokeWidth="0.3" />
    </svg>
  );
}

function BottomFlourish() {
  return (
    <svg
      width="130" height="18" viewBox="0 0 130 18"
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <path
        d="M65,9 C56,3 42,3 37,9 C32,15 46,15 56,9 M65,9 C74,15 88,15 93,9 C98,3 84,3 74,9"
        fill="none" stroke="rgba(240,196,140,0.22)" strokeWidth="0.5"
      />
      <path d="M65,6 L67,9 L65,12 L63,9 Z" fill="rgba(240,196,140,0.15)" stroke="rgba(240,196,140,0.3)" strokeWidth="0.4" />
      <circle cx="32" cy="9" r="0.8" fill="rgba(240,196,140,0.18)" />
      <circle cx="98" cy="9" r="0.8" fill="rgba(240,196,140,0.18)" />
    </svg>
  );
}

function CornerOrnament({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const transforms: Record<string, string> = {
    tl: "scale(1,1)",
    tr: "scale(-1,1)",
    bl: "scale(1,-1)",
    br: "scale(-1,-1)",
  };
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1 },
    tr: { top: -1, right: -1 },
    bl: { bottom: -1, left: -1 },
    br: { bottom: -1, right: -1 },
  };
  return (
    <svg
      width="30" height="30" viewBox="0 0 30 30"
      style={{ position: "absolute", ...positions[corner], pointerEvents: "none" }}
    >
      <g transform={transforms[corner]} style={{ transformOrigin: "15px 15px" }}>
        <path
          d="M2,2 C2,11 3,15 7,19 C9,21 13,23 15,27"
          fill="none" stroke="rgba(255,214,178,0.3)" strokeWidth="0.6"
        />
        <path
          d="M2,2 C8,2 12,4 15,7"
          fill="none" stroke="rgba(255,214,178,0.25)" strokeWidth="0.5"
        />
        <path
          d="M6,6 C8,4 10,5 9,7 C8,9 6,8 6,6Z"
          fill="rgba(240,196,140,0.1)" stroke="rgba(240,196,140,0.22)" strokeWidth="0.3"
        />
        <ellipse cx="11" cy="13" rx="2" ry="1" transform="rotate(-30,11,13)"
          fill="none" stroke="rgba(240,196,140,0.15)" strokeWidth="0.3"
        />
      </g>
    </svg>
  );
}

function Sparkles() {
  const dots = [
    { x: "10%", y: "16%", delay: 0, size: 2.2 },
    { x: "90%", y: "20%", delay: 1.2, size: 1.8 },
    { x: "18%", y: "80%", delay: 2.4, size: 1.6 },
    { x: "86%", y: "74%", delay: 0.8, size: 2 },
    { x: "50%", y: "10%", delay: 1.8, size: 1.4 },
    { x: "40%", y: "90%", delay: 3.0, size: 1.5 },
  ];
  return (
    <>
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 3,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(240,196,140,0.8), transparent)",
            boxShadow: `0 0 ${dot.size * 3}px rgba(240,196,140,0.3)`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}
    </>
  );
}

export default function ChoiceCard({ title, copy, choices, confirmLabel, onSelect }: ChoiceCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        bottom: "clamp(16px, 4vh, 32px)",
        left: 0,
        right: 0,
        zIndex: 60,
        width: "90%",
        maxWidth: 380,
        margin: "0 auto",
        pointerEvents: "auto",
      }}
    >
      {/* Outer ethereal glow */}
      <div style={{
        position: "absolute",
        inset: -14,
        borderRadius: 32,
        background: "radial-gradient(ellipse at 50% 40%, rgba(240,196,140,0.08), transparent 70%)",
        filter: "blur(16px)",
        zIndex: -1,
        pointerEvents: "none",
      }} />

      {/* Panel container */}
      <div style={{
        position: "relative",
        borderRadius: 18,
        overflow: "hidden",
      }}>
        {/* Double border */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          border: "1px solid rgba(255,214,178,0.14)",
          pointerEvents: "none",
          zIndex: 3,
        }} />
        <div style={{
          position: "absolute",
          inset: 5,
          borderRadius: 13,
          border: "0.5px solid rgba(240,196,140,0.08)",
          pointerEvents: "none",
          zIndex: 3,
        }} />

        {/* Corner ornaments */}
        <div style={{ position: "absolute", inset: 3, pointerEvents: "none", zIndex: 4 }}>
          <CornerOrnament corner="tl" />
          <CornerOrnament corner="tr" />
          <CornerOrnament corner="bl" />
          <CornerOrnament corner="br" />
        </div>

        {/* Sparkles */}
        <Sparkles />

        {/* Glass body */}
        <div style={{
          position: "relative",
          padding: "16px 14px 14px",
          background: "linear-gradient(180deg, rgba(18,20,28,0.94), rgba(11,12,18,0.94))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.35), " +
            "inset 0 1px 0 rgba(255,238,220,0.04)",
        }}>

          {/* Top flourish */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <TopFlourish />
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{
              textAlign: "center",
              fontSize: "clamp(18px, 5vw, 22px)",
              margin: "4px 0 4px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#FCEDE0",
              letterSpacing: "0.02em",
              textShadow: "0 0 20px rgba(240,196,140,0.12), 0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {title}
          </motion.h3>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{
              textAlign: "center",
              fontSize: 11,
              lineHeight: 1.5,
              margin: "0 10px 10px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 400,
              color: "rgba(255,233,214,0.55)",
              letterSpacing: "0.01em",
            }}
          >
            {copy}
          </motion.p>

          {/* Ornamental divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 12px 10px" }}>
            <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(90deg, transparent, rgba(240,196,140,0.18))" }} />
            <svg width="8" height="8" viewBox="0 0 8 8" style={{ opacity: 0.35 }}>
              <path d="M4,0.5 L7.5,4 L4,7.5 L0.5,4 Z" fill="none" stroke="rgba(240,196,140,1)" strokeWidth="0.5" />
            </svg>
            <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(90deg, rgba(240,196,140,0.18), transparent)" }} />
          </div>

          {/* Choice grid — 2 columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}>
            {choices.map((choice, i) => {
              const isActive = selected === choice.name;
              return (
                <motion.button
                  key={choice.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -1 }}
                  onClick={() => setSelected(choice.name)}
                  style={{
                    position: "relative",
                    textAlign: "left",
                    padding: "12px 12px",
                    borderRadius: 16,
                    background: isActive
                      ? "linear-gradient(180deg, rgba(223,164,108,0.18), rgba(25,18,20,0.9))"
                      : "linear-gradient(180deg, rgba(255,238,220,0.04), rgba(21,24,32,0.92))",
                    border: isActive
                      ? "1px solid rgba(240,196,140,0.55)"
                      : "1px solid rgba(255,222,196,0.10)",
                    cursor: "pointer",
                    outline: "none",
                    WebkitTapHighlightColor: "transparent",
                    transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                    boxShadow: isActive
                      ? "0 18px 40px rgba(224,168,105,0.18), inset 0 1px 0 rgba(255,230,200,0.08)"
                      : "0 10px 24px rgba(0,0,0,0.25)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    overflow: "hidden",
                  }}
                >
                  {/* Eyebrow — category label */}
                  {choice.label && (
                    <div style={{
                      fontSize: 10,
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      fontWeight: 600,
                      color: isActive ? "rgba(255,230,198,0.75)" : "rgba(255,233,214,0.55)",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase" as const,
                      marginBottom: 4,
                      transition: "color 0.35s ease",
                    }}>
                      {choice.label}
                    </div>
                  )}

                  {/* Main label — choice name */}
                  <div style={{
                    fontSize: 15,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: 600,
                    color: isActive ? "#FFE6C6" : "#FCEDE0",
                    letterSpacing: "0.015em",
                    lineHeight: 1.25,
                    marginBottom: 4,
                    transition: "color 0.35s ease",
                  }}>
                    {choice.name}
                  </div>

                  {/* Supporting copy */}
                  <div style={{
                    fontSize: 12,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: isActive ? "rgba(255,237,221,0.78)" : "rgba(255,237,221,0.68)",
                    lineHeight: 1.45,
                    transition: "color 0.35s ease",
                  }}>
                    {choice.copy}
                  </div>

                  {/* Active shimmer edge */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 2,
                        borderRadius: 1,
                        background: "linear-gradient(180deg, transparent, rgba(240,196,140,0.6), transparent)",
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Confirm */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: "center" }}
              >
                <div style={{
                  width: 30, height: "0.5px", margin: "2px auto 8px",
                  background: "linear-gradient(90deg, transparent, rgba(240,196,140,0.22), transparent)",
                }} />

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ boxShadow: "0 0 24px rgba(240,196,140,0.15)" }}
                  onClick={() => onSelect(selected)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 28px",
                    borderRadius: 20,
                    border: "1px solid rgba(240,196,140,0.3)",
                    background: "linear-gradient(135deg, rgba(240,196,140,0.12), rgba(223,164,108,0.04))",
                    cursor: "pointer",
                    outline: "none",
                    WebkitTapHighlightColor: "transparent",
                    boxShadow: "0 0 20px rgba(240,196,140,0.08), inset 0 1px 0 rgba(255,230,200,0.06)",
                    transition: "all 0.35s ease",
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                    color: "rgba(255,230,198,0.9)",
                    letterSpacing: "0.04em",
                  }}>
                    {confirmLabel}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: 0.6 }}>
                    <path d="M3,2 L8,6 L3,10" fill="none" stroke="rgba(255,230,198,1)" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom flourish */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            style={{ marginTop: selected ? 8 : 6 }}
          >
            <BottomFlourish />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
