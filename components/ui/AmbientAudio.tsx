"use client";

import { useEffect, useRef, useState } from "react";

const TRACK_SRC = "/audio/cry-for-you-instrumental.mp3";
const TARGET_VOLUME = 0.16;
const AUDIO_UNLOCK_EVENT = "build-a-date-audio-unlock";

function clampVolume(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const playingRef = useRef(false);
  const startingRef = useRef(false);
  const manualPauseRef = useRef(false);
  const mountedRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);

  function stopFade() {
    if (fadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }

  function setPlaybackState(nextState: boolean) {
    playingRef.current = nextState;
    if (mountedRef.current) {
      setIsPlaying(nextState);
    }
  }

  function fadeVolume(to: number, durationMs: number, onDone?: () => void) {
    const audio = audioRef.current;

    if (!audio) {
      onDone?.();
      return;
    }

    stopFade();

    const from = audio.volume;
    const target = clampVolume(to);
    const startedAt = performance.now();

    const tick = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);

      audio.volume = clampVolume(from + (target - from) * eased);

      if (progress >= 1) {
        fadeFrameRef.current = null;
        onDone?.();
        return;
      }

      fadeFrameRef.current = window.requestAnimationFrame(tick);
    };

    fadeFrameRef.current = window.requestAnimationFrame(tick);
  }

  async function startPlayback() {
    const audio = audioRef.current;

    if (!audio || startingRef.current || playingRef.current) {
      return;
    }

    startingRef.current = true;
    manualPauseRef.current = false;

    try {
      audio.load();
      audio.volume = 0.001;
      await audio.play();
      setPlaybackState(true);
      fadeVolume(TARGET_VOLUME, 3600);
    } catch {
      setPlaybackState(false);
    } finally {
      startingRef.current = false;
    }
  }

  function pausePlayback() {
    const audio = audioRef.current;

    manualPauseRef.current = true;

    if (!audio) {
      setPlaybackState(false);
      return;
    }

    if (audio.paused) {
      setPlaybackState(false);
      return;
    }

    fadeVolume(0, 650, () => {
      audio.pause();
      setPlaybackState(false);
    });
  }

  function handleToggle() {
    if (playingRef.current) {
      pausePlayback();
      return;
    }

    void startPlayback();
  }

  useEffect(() => {
    mountedRef.current = true;

    const audio = new Audio(TRACK_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.001;
    (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audioRef.current = audio;

    const handleFirstGesture = () => {
      if (manualPauseRef.current || playingRef.current || startingRef.current) {
        return;
      }

      void startPlayback();
    };

    window.addEventListener("pointerdown", handleFirstGesture, { passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { passive: true });
    window.addEventListener("touchend", handleFirstGesture, { passive: true });
    window.addEventListener("click", handleFirstGesture, { passive: true });
    window.addEventListener("keydown", handleFirstGesture);
    window.addEventListener(AUDIO_UNLOCK_EVENT, handleFirstGesture);

    void startPlayback();

    return () => {
      mountedRef.current = false;
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("touchend", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener(AUDIO_UNLOCK_EVENT, handleFirstGesture);
      stopFade();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  return (
    <button
      aria-label={isPlaying ? "Mute soundtrack" : "Play soundtrack"}
      aria-pressed={isPlaying}
      className={`audio-toggle ${isPlaying ? "audio-toggle-on" : "audio-toggle-off"}`}
      onClick={handleToggle}
      type="button"
    >
      <span className="audio-toggle-dot" aria-hidden="true" />
      <span>{isPlaying ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

export function requestAmbientAudioStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUDIO_UNLOCK_EVENT));
  }
}
