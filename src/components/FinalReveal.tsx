"use client";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import { labelFor } from "@/lib/choices";

// The headline "Your night is set." starts its fade-in after this many
// milliseconds. We fire the audio fade at the same moment so the music
// dissolves visibly-in-sync with the reveal text appearing.
const TITLE_FADE_DELAY_MS = 500;

export default function FinalReveal() {
  const { selectedDate, selectedDinner, selectedActivity, selectedDrinks, triggerAudioFadeOut } = useStore();

  // Kick off the background-music fade at the instant "Your night is set."
  // begins to appear — see TITLE_FADE_DELAY_MS above.
  useEffect(() => {
    const id = window.setTimeout(() => triggerAudioFadeOut(), TITLE_FADE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [triggerAudioFadeOut]);

  // On the reveal screen we still show Madison the romantic nicknames she
  // picked ("Big Time", "XO"). Dijon, however, needs plain-English answers
  // he can act on, so the outbound SMS uses the descriptive labels
  // ("Steakhouse", "XO HiFi") resolved via labelFor().
  const smsDinner = labelFor("dinner", selectedDinner);
  const smsActivity = labelFor("activity", selectedActivity);
  const smsDrinks = labelFor("drinks", selectedDrinks);

  const items = [
    { label: "The Night", value: selectedDate },
    { label: "Dinner", value: selectedDinner },
    { label: "The Vibe", value: selectedActivity },
    { label: "Last Stop", value: selectedDrinks },
  ];

  // Build the SMS href once the selections are known. Using a real anchor's
  // href (rather than `window.location.href = "sms:..."`) is the only
  // consistently reliable way to invoke the iOS Messages app from a web tap.
  // Per RFC 5724, `?body=` is the standard separator and is supported by iOS
  // 8+, Android, and everywhere else — the old iOS `&body=` workaround is no
  // longer necessary and can actually break on some recent iOS builds.
  const smsHref = useMemo(() => {
    const body = [
      "Build-A-Date - Madison's pick",
      "",
      `The Night: ${selectedDate ?? "-"}`,
      `Dinner: ${smsDinner ?? "-"}`,
      `The Vibe: ${smsActivity ?? "-"}`,
      `Last Stop: ${smsDrinks ?? "-"}`,
      "",
      "All you have to do is show up.",
    ].join("\n");
    const encoded = encodeURIComponent(body);
    const phone = "+13149229048";
    return `sms:${phone}?body=${encoded}`;
  }, [selectedDate, smsDinner, smsActivity, smsDrinks]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      style={{
        position: "absolute", inset: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at center 40%, rgba(18,10,25,0.92), rgba(5,3,10,0.98))",
        backdropFilter: "blur(40px)",
        // The parent overlay in page.tsx sets pointerEvents: "none" so petals
        // pass through. Every interactive child (ChoiceCard, CalendarPicker)
        // flips it back on at its root — FinalReveal has to do the same, or
        // the "Send it to Dijon" anchor never receives the tap.
        pointerEvents: "auto",
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "0 32px", maxWidth: 380, width: "100%",
      }}>
        {/* Decorative top flourish */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          style={{
            width: 60, height: 1, marginBottom: 28,
            background: "linear-gradient(90deg, transparent, rgba(255,190,210,0.3), transparent)",
          }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          style={{
            fontSize: "clamp(28px, 7vw, 38px)", marginBottom: 44,
            fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400,
            fontStyle: "italic",
            color: "#fff", textShadow: "0 0 40px rgba(255,180,200,0.15)",
            letterSpacing: "0.01em",
          }}
        >
          Your night is set.
        </motion.h2>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 22, marginBottom: 52 }}>
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.3, duration: 0.7 }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "10px 4px",
                borderBottom: "1px solid rgba(255,200,220,0.06)",
              }}
            >
              <span style={{
                fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.2em",
                fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 400,
                color: "rgba(255,220,230,0.3)",
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: "clamp(14px, 3.8vw, 16px)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                color: "rgba(255,225,235,0.9)",
                letterSpacing: "0.01em",
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
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}
        >
          <div style={{
            width: 40, height: 1, marginBottom: 28,
            background: "linear-gradient(90deg, transparent, rgba(255,180,200,0.2), transparent)",
          }} />

          {/* Plain <a> — framer-motion can swallow iOS's anchor→sms navigation
              via its pointer handlers. A vanilla anchor is the only form iOS
              reliably routes to the Messages app. */}
          <a
            href={smsHref}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "16px 0", borderRadius: 50,
              cursor: "pointer",
              textDecoration: "none",
              background: "linear-gradient(135deg, rgba(255,180,200,0.12), rgba(255,140,170,0.06))",
              border: "1px solid rgba(255,200,220,0.18)",
              outline: "none",
              transition: "transform 0.15s ease-out",
              WebkitTapHighlightColor: "transparent",
              boxShadow: "0 0 30px rgba(255,180,200,0.05), inset 0 1px 0 rgba(255,220,240,0.06)",
            }}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span style={{
              fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase" as const,
              fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 500,
              color: "rgba(255,235,220,0.9)",
            }}>
              Send it to Dijon
            </span>
          </a>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 1.2 }}
            style={{
              fontSize: 13, fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 400, color: "rgba(255,220,230,0.4)", letterSpacing: "0.02em",
              marginTop: 20,
            }}
          >
            All you have to do is show up.
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
