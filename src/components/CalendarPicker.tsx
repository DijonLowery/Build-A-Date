"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface CalendarPickerProps {
  onSelect: (label: string) => void;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Excluded weekend: April 24-27
const EXCLUDED = new Set(["2026-04-24", "2026-04-25", "2026-04-26", "2026-04-27"]);

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function isWeekend(year: number, month: number, day: number) {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 5 || dow === 6; // Sun, Fri, Sat
}

function formatDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${dayNames[date.getDay()]}, ${MONTH_NAMES[month]} ${day}`;
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getPoeticLine(year: number, month: number, day: number): string {
  const dow = new Date(year, month, day).getDay();
  const seed = month * 31 + day;
  const fridayLines = [
    "the kind of Friday that stays with you",
    "a Friday that feels different this time",
    "start the weekend right here",
    "Fridays were made for nights like this",
    "the city clears the way on Fridays",
  ];
  const saturdayLines = [
    "a Saturday made for two",
    "no rush — just the night ahead",
    "the city saved this Saturday",
    "Saturdays hit different with intention",
    "a Saturday that writes itself",
  ];
  const sundayLines = [
    "a slow start to something new",
    "Sunday, but make it intentional",
    "take the evening before Monday does",
    "one perfect Sunday night",
    "the quietest nights say the most",
  ];
  const idx = seed % 5;
  if (dow === 5) return fridayLines[idx];
  if (dow === 6) return saturdayLines[idx];
  return sundayLines[idx];
}

/* ── Ornate SVG vine flourish ── */
function TopFlourish() {
  return (
    <svg width="220" height="24" viewBox="0 0 220 24" style={{ display: "block", margin: "-2px auto 0", overflow: "visible" }}>
      <g transform="translate(110,12)">
        {[0, 60, 120, 180, 240, 300].map((rot) => (
          <ellipse key={rot} cx="0" cy="-3" rx="2" ry="3.5" transform={`rotate(${rot})`}
            fill="none" stroke="rgba(240,196,140,0.4)" strokeWidth="0.5" />
        ))}
        <circle r="1.8" fill="rgba(240,196,140,0.15)" stroke="rgba(240,196,140,0.45)" strokeWidth="0.4" />
        <circle r="0.7" fill="rgba(240,196,140,0.35)" />
      </g>
      <path d="M105,12 C95,12 85,8 70,9 C58,10 48,6 35,8 C25,9 18,7 8,10"
        fill="none" stroke="rgba(240,196,140,0.22)" strokeWidth="0.6" />
      <ellipse cx="70" cy="8" rx="4" ry="1.8" transform="rotate(-15,70,8)" fill="none" stroke="rgba(240,196,140,0.2)" strokeWidth="0.4" />
      <ellipse cx="48" cy="7" rx="3.5" ry="1.5" transform="rotate(10,48,7)" fill="none" stroke="rgba(240,196,140,0.17)" strokeWidth="0.4" />
      <ellipse cx="28" cy="8" rx="3" ry="1.3" transform="rotate(-8,28,8)" fill="none" stroke="rgba(240,196,140,0.14)" strokeWidth="0.4" />
      <circle cx="85" cy="9" r="1.2" fill="none" stroke="rgba(240,196,140,0.17)" strokeWidth="0.4" />
      <circle cx="58" cy="8" r="1" fill="none" stroke="rgba(240,196,140,0.14)" strokeWidth="0.3" />
      <path d="M115,12 C125,12 135,8 150,9 C162,10 172,6 185,8 C195,9 202,7 212,10"
        fill="none" stroke="rgba(240,196,140,0.22)" strokeWidth="0.6" />
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
    <svg width="130" height="18" viewBox="0 0 130 18" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
      <path d="M65,9 C56,3 42,3 37,9 C32,15 46,15 56,9 M65,9 C74,15 88,15 93,9 C98,3 84,3 74,9"
        fill="none" stroke="rgba(240,196,140,0.22)" strokeWidth="0.5" />
      <path d="M65,6 L67,9 L65,12 L63,9 Z" fill="rgba(240,196,140,0.15)" stroke="rgba(240,196,140,0.3)" strokeWidth="0.4" />
      <circle cx="32" cy="9" r="0.8" fill="rgba(240,196,140,0.18)" />
      <circle cx="98" cy="9" r="0.8" fill="rgba(240,196,140,0.18)" />
    </svg>
  );
}

function CornerOrnament({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const transforms: Record<string, string> = {
    tl: "scale(1,1)", tr: "scale(-1,1)", bl: "scale(1,-1)", br: "scale(-1,-1)",
  };
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1 }, tr: { top: -1, right: -1 },
    bl: { bottom: -1, left: -1 }, br: { bottom: -1, right: -1 },
  };
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" style={{ position: "absolute", ...positions[corner], pointerEvents: "none" }}>
      <g transform={transforms[corner]} style={{ transformOrigin: "15px 15px" }}>
        <path d="M2,2 C2,11 3,15 7,19 C9,21 13,23 15,27" fill="none" stroke="rgba(255,214,178,0.3)" strokeWidth="0.6" />
        <path d="M2,2 C8,2 12,4 15,7" fill="none" stroke="rgba(255,214,178,0.25)" strokeWidth="0.5" />
        <path d="M6,6 C8,4 10,5 9,7 C8,9 6,8 6,6Z" fill="rgba(240,196,140,0.1)" stroke="rgba(240,196,140,0.22)" strokeWidth="0.3" />
        <ellipse cx="11" cy="13" rx="2" ry="1" transform="rotate(-30,11,13)" fill="none" stroke="rgba(240,196,140,0.15)" strokeWidth="0.3" />
      </g>
    </svg>
  );
}

function Sparkles() {
  const dots = [
    { x: "10%", y: "6%", delay: 0.3, size: 2 },
    { x: "90%", y: "8%", delay: 1.5, size: 1.8 },
    { x: "18%", y: "94%", delay: 2.8, size: 1.5 },
    { x: "85%", y: "92%", delay: 0.9, size: 2.2 },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <motion.div key={i}
          animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", left: d.x, top: d.y,
            width: d.size, height: d.size, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(240,196,140,0.7), transparent)",
            boxShadow: `0 0 ${d.size * 3}px rgba(240,196,140,0.25)`,
            pointerEvents: "none", zIndex: 2,
          }}
        />
      ))}
    </>
  );
}

const CELL = 28;

function MonthGrid({ year, month, selectedKey, onTap }: {
  year: number; month: number;
  selectedKey: string | null;
  onTap: (key: string, label: string, poeticLine: string) => void;
}) {
  const { firstDay, daysInMonth } = getMonthData(year, month);
  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} style={{ width: CELL, height: CELL }} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(year, month, d);
    const weekend = isWeekend(year, month, d);
    const excluded = EXCLUDED.has(key);
    const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = key === todayKey;
    const available = weekend && !excluded && !isPast;
    const isSelected = selectedKey === key;

    cells.push(
      <motion.button
        key={d}
        whileTap={available ? { scale: 0.88 } : undefined}
        onClick={available ? () => onTap(key, formatDate(year, month, d), getPoeticLine(year, month, d)) : undefined}
        disabled={!available}
        style={{
          width: CELL,
          height: CELL,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: isSelected
            ? "1.5px solid rgba(240,196,140,0.55)"
            : isToday
            ? "1px solid rgba(240,196,140,0.35)"
            : available
            ? "1px solid rgba(255,222,196,0.10)"
            : "1px solid transparent",
          background: isSelected
            ? "linear-gradient(180deg, rgba(223,164,108,0.18), rgba(25,18,20,0.9))"
            : available
            ? "linear-gradient(180deg, rgba(255,238,220,0.04), rgba(21,24,32,0.92))"
            : "transparent",
          cursor: available ? "pointer" : "default",
          outline: "none",
          WebkitTapHighlightColor: "transparent",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: isSelected
            ? "0 18px 40px rgba(224,168,105,0.18), inset 0 1px 0 rgba(255,230,200,0.08)"
            : available
            ? "0 6px 14px rgba(0,0,0,0.25)"
            : "none",
        }}
      >
        <span style={{
          fontSize: 12,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: isSelected ? 700 : available ? 600 : 300,
          color: isSelected
            ? "#FFE6C6"
            : available
            ? "#FCEDE0"
            : isPast
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.16)",
          letterSpacing: "0.01em",
        }}>
          {d}
        </span>
      </motion.button>
    );
  }

  return (
    <div>
      <p style={{
        textAlign: "center",
        fontSize: 10.5,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontWeight: 600,
        color: "rgba(255,233,214,0.55)",
        marginBottom: 3,
        letterSpacing: "0.22em",
        textTransform: "uppercase" as const,
      }}>
        {MONTH_NAMES[month]}
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(7, ${CELL}px)`,
        justifyContent: "center",
        gap: 1,
        marginBottom: 2,
      }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{
            width: CELL, height: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 600,
            color: (i === 0 || i === 5 || i === 6) ? "rgba(240,196,140,0.45)" : "rgba(255,233,214,0.25)",
            letterSpacing: "0.14em",
          }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(7, ${CELL}px)`,
        justifyContent: "center",
        gap: 1,
      }}>
        {cells}
      </div>
    </div>
  );
}

export default function CalendarPicker({ onSelect }: CalendarPickerProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [poeticLine, setPoeticLine] = useState<string | null>(null);

  const handleTap = (key: string, label: string, poetic: string) => {
    setSelectedKey(key);
    setSelectedLabel(label);
    setPoeticLine(poetic);
  };

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
        position: "absolute", inset: -14, borderRadius: 32,
        background: "radial-gradient(ellipse at 50% 40%, rgba(240,196,140,0.08), transparent 70%)",
        filter: "blur(16px)", zIndex: -1, pointerEvents: "none",
      }} />

      {/* Panel container */}
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
        {/* Double border */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: "1px solid rgba(255,214,178,0.14)", pointerEvents: "none", zIndex: 3 }} />
        <div style={{ position: "absolute", inset: 5, borderRadius: 13, border: "0.5px solid rgba(240,196,140,0.08)", pointerEvents: "none", zIndex: 3 }} />

        {/* Corner ornaments */}
        <div style={{ position: "absolute", inset: 3, pointerEvents: "none", zIndex: 4 }}>
          <CornerOrnament corner="tl" />
          <CornerOrnament corner="tr" />
          <CornerOrnament corner="bl" />
          <CornerOrnament corner="br" />
        </div>

        <Sparkles />

        {/* Glass body */}
        <div style={{
          position: "relative",
          padding: "12px 12px 12px",
          background: "linear-gradient(180deg, rgba(18,20,28,0.94), rgba(11,12,18,0.94))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.35), " +
            "inset 0 1px 0 rgba(255,238,220,0.04)",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto" as const,
          WebkitOverflowScrolling: "touch" as const,
        }}>
          {/* Top flourish */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
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
              fontSize: "clamp(17px, 4.8vw, 20px)",
              margin: "2px 0 3px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400, fontStyle: "italic",
              color: "#FCEDE0",
              letterSpacing: "0.02em",
              textShadow: "0 0 20px rgba(240,196,140,0.12), 0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            First... pick the night.
          </motion.h3>

          {/* Copy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{
              textAlign: "center",
              fontSize: 10.5, lineHeight: 1.45,
              margin: "0 10px 8px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              color: "rgba(255,233,214,0.55)",
              letterSpacing: "0.01em",
            }}
          >
            Main Street kept the board lit for a reason. Tap the night that feels right.
          </motion.p>

          {/* Ornamental divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 12px 8px" }}>
            <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(90deg, transparent, rgba(240,196,140,0.18))" }} />
            <svg width="8" height="8" viewBox="0 0 8 8" style={{ opacity: 0.35 }}>
              <path d="M4,0.5 L7.5,4 L4,7.5 L0.5,4 Z" fill="none" stroke="rgba(240,196,140,1)" strokeWidth="0.5" />
            </svg>
            <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(90deg, rgba(240,196,140,0.18), transparent)" }} />
          </div>

          {/* Calendars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <MonthGrid year={2026} month={3} selectedKey={selectedKey} onTap={handleTap} />
            <MonthGrid year={2026} month={4} selectedKey={selectedKey} onTap={handleTap} />
          </motion.div>

          {/* Selected date info — styled as a card */}
          <AnimatePresence>
            {selectedLabel && poeticLine && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.4 }}
                style={{
                  marginTop: 10,
                  padding: "10px 14px 9px",
                  borderRadius: 16,
                  background: "linear-gradient(180deg, rgba(223,164,108,0.18), rgba(25,18,20,0.9))",
                  border: "1px solid rgba(240,196,140,0.55)",
                  boxShadow: "0 18px 40px rgba(224,168,105,0.18), inset 0 1px 0 rgba(255,230,200,0.08)",
                  textAlign: "center",
                }}
              >
                {/* Eyebrow */}
                <div style={{
                  fontSize: 10,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 600,
                  color: "#FFE6C6",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase" as const,
                  marginBottom: 6,
                }}>
                  The Night
                </div>
                {/* Main label */}
                <div style={{
                  fontSize: 16,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 600,
                  color: "#FCEDE0",
                  lineHeight: 1.2,
                  marginBottom: 6,
                  letterSpacing: "0.015em",
                }}>
                  {selectedLabel}
                </div>
                {/* Supporting copy */}
                <div style={{
                  fontSize: 12,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  color: "rgba(255,237,221,0.78)",
                  lineHeight: 1.45,
                }}>
                  {poeticLine}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm button */}
          <AnimatePresence>
            {selectedLabel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ textAlign: "center" }}
              >
                <div style={{
                  width: 30, height: "0.5px", margin: "10px auto 8px",
                  background: "linear-gradient(90deg, transparent, rgba(240,196,140,0.22), transparent)",
                }} />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ boxShadow: "0 0 24px rgba(240,196,140,0.15)" }}
                  onClick={() => selectedLabel && onSelect(selectedLabel)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 26px", borderRadius: 20,
                    border: "1px solid rgba(240,196,140,0.3)",
                    background: "linear-gradient(135deg, rgba(240,196,140,0.12), rgba(223,164,108,0.04))",
                    cursor: "pointer", outline: "none",
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
                    Keep this night
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: 0.6 }}>
                    <path d="M3,2 L8,6 L3,10" fill="none" stroke="rgba(255,230,198,1)" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint */}
          {!selectedLabel && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              style={{
                textAlign: "center", fontSize: 10, marginTop: 12,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontWeight: 600,
                color: "rgba(255,233,214,0.28)",
                letterSpacing: "0.22em",
                textTransform: "uppercase" as const,
              }}
            >
              Tap A Weekend Evening
            </motion.p>
          )}

          {/* Bottom flourish */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{ marginTop: 6 }}
          >
            <BottomFlourish />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
