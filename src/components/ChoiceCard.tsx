"use client";
import { motion } from "framer-motion";

interface Choice {
  label: string;
  subtitle?: string;
}

interface ChoiceCardProps {
  title: string;
  subtitle: string;
  choices: Choice[];
  onSelect: (label: string) => void;
}

export default function ChoiceCard({ title, subtitle, choices, onSelect }: ChoiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px calc(16px + env(safe-area-inset-bottom, 0px))",
          pointerEvents: "auto",
          background: "linear-gradient(180deg, rgba(15,10,25,0.96), rgba(10,8,20,0.99))",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,200,220,0.12)",
          borderBottom: "none",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(255,180,200,0.05)",
        }}
      >
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            textAlign: "center",
            fontSize: 18,
            margin: "0 0 2px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "rgba(255,220,230,0.95)",
          }}
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{
            textAlign: "center",
            fontSize: 10,
            margin: "0 0 14px",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 300,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.08em",
          }}
        >
          {subtitle}
        </motion.p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {choices.map((choice, i) => (
            <motion.button
              key={choice.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(choice.label)}
              style={{
                width: "100%",
                borderRadius: 14,
                padding: "12px 16px",
                minHeight: 48,
                textAlign: "left",
                cursor: "pointer",
                background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,200,220,0.08)",
                outline: "none",
                transition: "all 0.3s",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,180,200,0.12), rgba(255,140,170,0.06))";
                e.currentTarget.style.borderColor = "rgba(255,200,220,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))";
                e.currentTarget.style.borderColor = "rgba(255,200,220,0.08)";
              }}
            >
              <span style={{
                display: "block",
                fontSize: 14,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontWeight: 500,
                color: "rgba(255,230,240,0.9)",
                letterSpacing: "0.02em",
              }}>
                {choice.label}
              </span>
              {choice.subtitle && (
                <span style={{
                  display: "block",
                  fontSize: 11,
                  marginTop: 1,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.35)",
                }}>
                  {choice.subtitle}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
