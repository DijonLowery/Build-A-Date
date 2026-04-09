"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store";
import ChoiceCard from "./ChoiceCard";
import FinalReveal from "./FinalReveal";

export default function WorldUI() {
  const {
    worldPhase,
    showChoice,
    setSelectedDate,
    setSelectedDinner,
    setSelectedActivity,
    setSelectedDrinks,
    advancePhase,
  } = useStore();

  const handleSelect = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setTimeout(() => advancePhase(), 600);
  };

  if (worldPhase === "reveal") {
    return <FinalReveal />;
  }

  return (
    <AnimatePresence mode="wait">
      {showChoice && worldPhase === "mainStreet" && (
        <ChoiceCard
          key="date"
          title="Pick the night"
          subtitle="when should we make this happen?"
          choices={[
            { label: "Friday, April 11", subtitle: "sooner than you think" },
            { label: "Saturday, April 12", subtitle: "take our time with it" },
            { label: "Friday, April 18", subtitle: "something to look forward to" },
            { label: "Saturday, April 19", subtitle: "the weekend after" },
          ]}
          onSelect={handleSelect(setSelectedDate)}
        />
      )}

      {showChoice && worldPhase === "dinner" && (
        <ChoiceCard
          key="dinner"
          title="Where we eating?"
          subtitle="the night starts with a table for two"
          choices={[
            { label: "Big Time", subtitle: "801 Chophouse" },
            { label: "You Already Know", subtitle: "Cooper's Hawk" },
            { label: "Let Me Lead", subtitle: "something new" },
            { label: "Chef BoyarDijon", subtitle: "I cook for you" },
          ]}
          onSelect={handleSelect(setSelectedDinner)}
        />
      )}

      {showChoice && worldPhase === "activity" && (
        <ChoiceCard
          key="activity"
          title="What's the vibe?"
          subtitle="the city is ours tonight"
          choices={[
            { label: "Music & Vibes", subtitle: "live sounds, close quarters" },
            { label: "Walk & Talk", subtitle: "just us and the city" },
            { label: "A Little Fun", subtitle: "something playful" },
            { label: "Surprise Me", subtitle: "I trust you" },
          ]}
          onSelect={handleSelect(setSelectedActivity)}
        />
      )}

      {showChoice && worldPhase === "drinks" && (
        <ChoiceCard
          key="drinks"
          title="Last stop"
          subtitle="one more before the night ends"
          choices={[
            { label: "XO", subtitle: "rooftop with a view" },
            { label: "Lowkey Spot", subtitle: "just us, no crowd" },
            { label: "Rooftop", subtitle: "city lights and conversation" },
            { label: "Nightcap Energy", subtitle: "wherever the night takes us" },
          ]}
          onSelect={handleSelect(setSelectedDrinks)}
        />
      )}
    </AnimatePresence>
  );
}
