"use client";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { PHASE_CONFIGS } from "@/lib/choices";
import ChoiceCard from "./ChoiceCard";
import CalendarPicker from "./CalendarPicker";
import FinalReveal from "./FinalReveal";

export default function WorldUI() {
  const worldPhase = useStore((s) => s.worldPhase);
  const showChoice = useStore((s) => s.showChoice);
  const advancePhase = useStore((s) => s.advancePhase);
  const store = useStore();

  if (worldPhase === "reveal") {
    return <FinalReveal />;
  }

  // Calendar for date selection
  if (worldPhase === "mainStreet" && showChoice) {
    const handleDateSelect = (value: string) => {
      store.setSelectedDate(value);
      setTimeout(() => advancePhase(), 600);
    };
    return (
      <AnimatePresence>
        <CalendarPicker key="calendar" onSelect={handleDateSelect} />
      </AnimatePresence>
    );
  }

  const config = PHASE_CONFIGS[worldPhase];
  const visible = showChoice && !!config;

  const handleSelect = (value: string) => {
    if (!config) return;
    (store[config.field] as (v: string) => void)(value);
    setTimeout(() => advancePhase(), 600);
  };

  return (
    <AnimatePresence>
      {visible && config && (
        <ChoiceCard
          key={worldPhase}
          title={config.title}
          copy={config.copy}
          choices={config.choices}
          confirmLabel={config.confirmLabel}
          onSelect={handleSelect}
        />
      )}
    </AnimatePresence>
  );
}
