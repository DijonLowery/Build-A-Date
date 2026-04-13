"use client";
import { motion } from "framer-motion";
import { useStore } from "@/store";

export default function InstructionScreen() {
  const { setMode } = useStore();

  const handleContinue = () => {
    setMode("world");
  };

  const bullets = [
    "This is Madison and Dijon. The two of you are already in the city together.",
    "Take my hand and let the lights lead. When a place begins to glow, touch it and see what the night is offering.",
    "You do not have to steer anything hard. Just choose what feels right and let the city carry the rest.",
  ];

  return (
    <>
      {/* Soft vignette over the world so the panel has readable contrast
          without hiding the characters — they should still shine through. */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 34,
        background:
          "linear-gradient(180deg, rgba(8,6,14,0.35) 0%, rgba(5,4,10,0.1) 35%, rgba(5,4,10,0.6) 72%, rgba(3,2,6,0.92) 100%)",
        pointerEvents: "none",
      }} />

      {/* Bottom instruction panel — characters remain visible above */}
      <motion.div
        initial={false}
        animate={{ opacity: [0, 1], y: [24, 0] }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          opacity: 1,
          position: "fixed",
          left: 0, right: 0,
          bottom: "clamp(20px, 4vh, 36px)",
          zIndex: 35,
          display: "flex", justifyContent: "center",
          padding: "0 16px",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          pointerEvents: "auto",
        }}
      >
        <div style={{
          width: "100%", maxWidth: 420,
          padding: "18px 22px 20px",
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(14,11,20,0.88), rgba(8,6,14,0.94))",
          border: "1px solid rgba(255,214,178,0.14)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), " +
            "inset 0 1px 0 rgba(255,238,220,0.04)",
          WebkitBackdropFilter: "blur(18px)",
          backdropFilter: "blur(18px)",
        }}>
          {/* Eyebrow */}
          <motion.p
            initial={false}
            animate={{ opacity: [0, 1], y: [8, 0] }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              opacity: 1,
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" as const,
              fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 600,
              color: "rgba(255,220,200,0.45)", marginBottom: 6, textAlign: "center",
            }}
          >
            Before we step into it
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={false}
            animate={{ opacity: [0, 1], y: [10, 0] }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{
              opacity: 1,
              fontSize: "clamp(22px, 6vw, 28px)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400, fontStyle: "italic",
              color: "#fdf5e6",
              marginBottom: 12, lineHeight: 1.15,
              textAlign: "center",
              letterSpacing: "0.01em",
              textShadow: "0 2px 18px rgba(0,0,0,0.6)",
            }}
          >
            Take my hand.
          </motion.h2>

          {/* Bullets — condensed list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4, marginBottom: 14 }}>
            {bullets.map((text, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ opacity: [0, 1], x: [-8, 0] }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.55 }}
                style={{ opacity: 1, display: "flex", gap: 10, alignItems: "flex-start" }}
              >
                <div style={{
                  width: 5, height: 5, borderRadius: "50%", marginTop: 8, flexShrink: 0,
                  background: "rgba(240,196,140,0.55)",
                  boxShadow: "0 0 6px rgba(240,196,140,0.35)",
                }} />
                <p style={{
                  fontSize: "clamp(12px, 3.4vw, 13.5px)",
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 300, color: "rgba(255,245,235,0.78)",
                  lineHeight: 1.55,
                }}>
                  {text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            initial={false}
            animate={{ opacity: [0, 1], y: [8, 0] }}
            transition={{ delay: 1.0, duration: 0.6 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            style={{
              opacity: 1,
              width: "100%", padding: "12px 0", borderRadius: 50, cursor: "pointer",
              background: "linear-gradient(135deg, rgba(240,196,140,0.14), rgba(223,164,108,0.06))",
              border: "1px solid rgba(240,196,140,0.32)",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              boxShadow: "0 0 22px rgba(240,196,140,0.08), inset 0 1px 0 rgba(255,230,200,0.06)",
            }}
          >
            <span style={{
              fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase" as const,
              fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500,
              color: "rgba(255,235,215,0.92)",
            }}>
              Take My Hand
            </span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
