"use client";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import ChoiceCard from "./ChoiceCard";
import CalendarPicker from "./CalendarPicker";
import FinalReveal from "./FinalReveal";

const PHASE_CONFIGS: Record<string, {
  title: string;
  copy: string;
  confirmLabel: string;
  choices: { name: string; label?: string; copy: string }[];
  field: "setSelectedDinner" | "setSelectedActivity" | "setSelectedDrinks";
}> = {
  dinner: {
    title: "Then\u2026 we eat.",
    copy: "The city quieted down on purpose. Choose the table that feels like the night turning personal.",
    confirmLabel: "Set dinner here",
    field: "setSelectedDinner",
    choices: [
      { name: "Big Time", label: "Steakhouse", copy: "\u201CYou said big time\u2026 so we start here.\u201D" },
      { name: "You Already Know", label: "Cooper\u2019s Hawk", copy: "\u201CSomewhere you already know you like.\u201D" },
      { name: "Let Me Lead", label: "Something New", copy: "\u201CLet me put you onto something.\u201D" },
      { name: "Chef BoyarDijon", label: "I cook for you", copy: "\u201COr\u2026 I make this a different level.\u201D" },
    ],
  },
  activity: {
    title: "Then\u2026 we set the vibe.",
    copy: "The city picked up a pulse, but it kept the room soft for the two of you. Choose how the night starts moving.",
    confirmLabel: "Let this be the vibe",
    field: "setSelectedActivity",
    choices: [
      { name: "Music & Vibes", copy: "\u201CYou + music = easy choice.\u201D" },
      { name: "Walk & Talk", copy: "\u201CThis is where the real conversations happen.\u201D" },
      { name: "A Little Fun", copy: "\u201CJust enough chaos to keep it interesting.\u201D" },
      { name: "Surprise Me", copy: "\u201CTrust me and let me make the call.\u201D" },
    ],
  },
  drinks: {
    title: "One more stop.",
    copy: "The skyline saved the last word. Choose where the night settles, and let the city glow beneath you.",
    confirmLabel: "Keep the night here",
    field: "setSelectedDrinks",
    choices: [
      { name: "XO", label: "XO HiFi", copy: "\u201CYou already said you\u2019d be down\u2026\u201D" },
      { name: "Lowkey Spot", label: "A hidden favorite", copy: "\u201CMy kind of place. You\u2019ll see.\u201D" },
      { name: "Rooftop", label: "City views", copy: "\u201CEnd the night with a view.\u201D" },
      { name: "One More Stop", label: "Keep it going", copy: "\u201COnly if the night still wants a little more.\u201D" },
    ],
  },
};

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
