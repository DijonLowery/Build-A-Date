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
    <div style={{
      position: "fixed", inset: 0, zIndex: 35,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, rgba(8,6,14,0.97) 0%, rgba(5,4,10,0.99) 100%)",
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          maxWidth: 380, width: "100%", padding: "0 28px",
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" as const,
            fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 400,
            color: "rgba(255,220,200,0.4)", marginBottom: 8,
          }}
        >
          Before we step into it
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            fontSize: "clamp(28px, 7vw, 36px)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700, color: "#fdf5e6",
            marginBottom: 24, lineHeight: 1.15,
          }}
        >
          Take my hand.
        </motion.h2>

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{
            fontSize: "clamp(14px, 3.8vw, 16px)",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 300, color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7, marginBottom: 32,
          }}
        >
          Kansas City is leading tonight, but gently. This is
          not a game to steer through. It is a guided walk,
          and Dijon keeps showing Madison the next part of
          the night.
        </motion.p>

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 40 }}>
          {bullets.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.3, duration: 0.6 }}
              style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                background: "rgba(255,190,140,0.5)",
              }} />
              <p style={{
                fontSize: "clamp(13px, 3.5vw, 15px)",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontWeight: 300, color: "rgba(255,255,255,0.55)",
                lineHeight: 1.65,
              }}>
                {text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 50, cursor: "pointer",
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,200,220,0.12)",
            outline: "none",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,200,220,0.25)";
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,200,220,0.12)";
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))";
          }}
        >
          <span style={{
            fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" as const,
            fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500,
            color: "rgba(255,230,210,0.8)",
          }}>
            Take My Hand
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
