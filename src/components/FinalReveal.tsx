"use client";
import { motion } from "framer-motion";
import { useStore } from "@/store";

export default function FinalReveal() {
  const { selectedDate, selectedDinner, selectedActivity, selectedDrinks } = useStore();

  const items = [
    { label: "The Night", value: selectedDate },
    { label: "Dinner", value: selectedDinner },
    { label: "The Vibe", value: selectedActivity },
    { label: "Last Stop", value: selectedDrinks },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      style={{
        position: "absolute", inset: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, rgba(8,5,15,0.95), rgba(5,3,10,0.98))",
        backdropFilter: "blur(30px)",
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "0 32px", maxWidth: 380, width: "100%",
      }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            fontSize: "clamp(28px, 7vw, 36px)", marginBottom: 40,
            fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400,
            color: "#fff", textShadow: "0 0 30px rgba(255,180,200,0.2)",
          }}
        >
          Your night is set.
        </motion.h2>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20, marginBottom: 48 }}>
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.3, duration: 0.7 }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "8px 8px", borderBottom: "1px solid rgba(255,200,220,0.08)",
              }}
            >
              <span style={{
                fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.15em",
                fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 300,
                color: "rgba(255,255,255,0.35)",
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: 14, fontFamily: "Georgia, 'Times New Roman', serif",
                color: "rgba(255,220,230,0.9)",
              }}>
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
        >
          <div style={{
            width: 48, height: 1, marginBottom: 24,
            background: "linear-gradient(90deg, transparent, rgba(255,180,200,0.3), transparent)",
          }} />
          <p style={{
            fontSize: 18, fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400, color: "rgba(255,220,230,0.85)",
          }}>
            Say less.
          </p>
          <p style={{
            fontSize: 15, fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 300, color: "rgba(255,255,255,0.5)", letterSpacing: "0.03em",
          }}>
            I got it from here.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
