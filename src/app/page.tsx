"use client";
import { useStore } from "@/store";
import TitlePrologue from "@/components/TitlePrologue";
import InstructionScreen from "@/components/InstructionScreen";
import WorldCanvas from "@/components/WorldCanvas";
import WorldUI from "@/components/WorldUI";
import PetalOverlay from "@/components/PetalOverlay";
import BackgroundMusic from "@/components/BackgroundMusic";

export default function Home() {
  const mode = useStore((s) => s.mode);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      {/* Title Prologue */}
      {mode === "title" && <TitlePrologue />}

      {/* Transition dissolve */}
      {mode === "transition" && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 30,
            background: "radial-gradient(ellipse at center, rgba(15,10,25,0.95), #000)",
          }}
        >
          <PetalOverlay count={40} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <p style={{
              fontSize: 17, letterSpacing: "0.2em",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontWeight: 300, color: "rgba(255,220,230,0.6)",
            }}>
              stepping into the night&hellip;
            </p>
          </div>
        </div>
      )}

      {/* Live 3D World — stays mounted through instructions + world so characters
          remain visible behind the instructions panel. Intro animation is paused
          until mode === "world" (see CharacterPair / CameraRig). */}
      {(mode === "instructions" || mode === "world") && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10 }}>
          <WorldCanvas />
        </div>
      )}

      {/* Instruction overlay — sits over the 3D world as a bottom panel */}
      {mode === "instructions" && <InstructionScreen />}

      {/* World interaction layers (only during "world" mode) */}
      {mode === "world" && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none" }}>
            <PetalOverlay count={8} />
          </div>
          <div style={{ position: "fixed", inset: 0, zIndex: 55, pointerEvents: "none" }}>
            <WorldUI />
          </div>
        </>
      )}

      {/* Background music */}
      <BackgroundMusic />
    </div>
  );
}
