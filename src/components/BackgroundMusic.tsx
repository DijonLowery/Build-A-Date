"use client";
import { useEffect, useRef } from "react";
import { useStore } from "@/store";

export default function BackgroundMusic() {
  const mode = useStore((s) => s.mode);
  const audioFadeOut = useStore((s) => s.audioFadeOut);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (mode === "world" && !hasStarted.current) {
      hasStarted.current = true;
      const audio = new Audio("/cry-for-you.mp3");
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;

      // Fade in
      audio.play().then(() => {
        let vol = 0;
        const fade = setInterval(() => {
          vol = Math.min(vol + 0.02, 0.5);
          audio.volume = vol;
          if (vol >= 0.5) clearInterval(fade);
        }, 100);
      }).catch(() => {
        // Browser may block autoplay; that's okay
      });
    }
  }, [mode]);

  // Fade out when SMS is triggered
  useEffect(() => {
    if (audioFadeOut && audioRef.current) {
      const audio = audioRef.current;
      const fade = setInterval(() => {
        const next = Math.max(audio.volume - 0.03, 0);
        audio.volume = next;
        if (next <= 0) {
          clearInterval(fade);
          audio.pause();
        }
      }, 80);
    }
  }, [audioFadeOut]);

  return null;
}
