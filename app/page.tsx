"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { PetalOverlay } from "@/components/title/PetalOverlay";
import { AmbientAudio, requestAmbientAudioStart, requestAmbientAudioStop } from "@/components/ui/AmbientAudio";
import { TitlePrologue } from "@/components/title/TitlePrologue";
import { ChoicePanel } from "@/components/ui/ChoicePanel";
import { FinalReveal } from "@/components/ui/FinalReveal";
import { OverlayText } from "@/components/ui/OverlayText";
import { WorldInstructions } from "@/components/ui/WorldInstructions";
import { WorldCanvas } from "@/components/world/WorldCanvas";
import type { JourneyPhase, JourneyStop } from "@/components/world/RouteController";
import { activityOptions } from "@/lib/activityOptions";
import { dateOptions } from "@/lib/dateOptions";
import { dinnerOptions } from "@/lib/dinnerOptions";
import { drinksOptions } from "@/lib/drinksOptions";

export default function Page() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://made4madison.vercel.app").replace(/\/$/, "");
  const [phase, setPhase] = useState<JourneyPhase>("prologue");
  const [startRequested, setStartRequested] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedDinnerId, setSelectedDinnerId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedDrinksId, setSelectedDrinksId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [worldPrepared, setWorldPrepared] = useState(false);
  const datePromptOpenedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const debugPhase = params.get("debugPhase") as JourneyPhase | null;

    if (debugPhase) {
      const firstDate = dateOptions[0]?.id ?? null;
      const firstDinner = dinnerOptions[0]?.id ?? null;
      const firstActivity = activityOptions[0]?.id ?? null;
      const firstDrinks = drinksOptions[0]?.id ?? null;

      const needsDate =
        debugPhase !== "prologue" &&
        debugPhase !== "transition" &&
        debugPhase !== "introBrief" &&
        debugPhase !== "walkingDate" &&
        debugPhase !== "arrivedDate" &&
        debugPhase !== "selectingDate";
      const needsDinner =
        debugPhase === "lockedDinner" ||
        debugPhase === "walkingActivity" ||
        debugPhase === "arrivedActivity" ||
        debugPhase === "selectingActivity" ||
        debugPhase === "lockedActivity" ||
        debugPhase === "walkingDrinks" ||
        debugPhase === "arrivedDrinks" ||
        debugPhase === "selectingDrinks" ||
        debugPhase === "lockedDrinks" ||
        debugPhase === "finalReveal" ||
        debugPhase === "submitted";
      const needsActivity =
        debugPhase === "lockedActivity" ||
        debugPhase === "walkingDrinks" ||
        debugPhase === "arrivedDrinks" ||
        debugPhase === "selectingDrinks" ||
        debugPhase === "lockedDrinks" ||
        debugPhase === "finalReveal" ||
        debugPhase === "submitted";
      const needsDrinks =
        debugPhase === "lockedDrinks" || debugPhase === "finalReveal" || debugPhase === "submitted";

      setSelectedDateId(needsDate ? firstDate : null);
      setSelectedDinnerId(needsDinner ? firstDinner : null);
      setSelectedActivityId(needsActivity ? firstActivity : null);
      setSelectedDrinksId(needsDrinks ? firstDrinks : null);
      setWorldPrepared(true);
      setStartRequested(false);
      setPhase(debugPhase);
      return;
    }

    if (!params.has("debugWorld")) {
      return;
    }

    setWorldPrepared(true);
    setStartRequested(false);
    setPhase("walkingDate");
  }, []);

  const selectedDate = useMemo(
    () => dateOptions.find((option) => option.id === selectedDateId) ?? null,
    [selectedDateId]
  );
  const selectedDinner = useMemo(
    () => dinnerOptions.find((option) => option.id === selectedDinnerId) ?? null,
    [selectedDinnerId]
  );
  const selectedActivity = useMemo(
    () => activityOptions.find((option) => option.id === selectedActivityId) ?? null,
    [selectedActivityId]
  );
  const selectedDrinks = useMemo(
    () => drinksOptions.find((option) => option.id === selectedDrinksId) ?? null,
    [selectedDrinksId]
  );

  useEffect(() => {
    if (!startRequested || !worldPrepared || phase !== "prologue") {
      return;
    }

    window.requestAnimationFrame(() => {
      startTransition(() => {
        setSubmitted(false);
        setPhase("transition");
        setStartRequested(false);
      });
    });
  }, [phase, startRequested, worldPrepared]);

  useEffect(() => {
    if (phase !== "transition") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("introBrief");
    }, 2100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "introBrief") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase((current) => (current === "introBrief" ? "walkingDate" : current));
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "prologue" || phase === "transition" || phase === "introBrief" || phase === "walkingDate") {
      datePromptOpenedRef.current = false;
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "arrivedDate" || datePromptOpenedRef.current) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      datePromptOpenedRef.current = true;
      setPhase((current) => (current === "arrivedDate" ? "selectingDate" : current));
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "lockedDate") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("leavingDate");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leavingDate") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("walkingDinner");
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "arrivedDinner") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase((current) => (current === "arrivedDinner" ? "selectingDinner" : current));
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "lockedDinner") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("walkingActivity");
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "arrivedActivity") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase((current) => (current === "arrivedActivity" ? "selectingActivity" : current));
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "lockedActivity") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("walkingDrinks");
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "arrivedDrinks") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase((current) => (current === "arrivedDrinks" ? "selectingDrinks" : current));
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "lockedDrinks") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("finalReveal");
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  function handleStart() {
    requestAmbientAudioStart();
    setStartRequested(true);

    if (worldPrepared && phase === "prologue") {
      window.requestAnimationFrame(() => {
        startTransition(() => {
          setSubmitted(false);
          setPhase("transition");
          setStartRequested(false);
        });
      });
    }
  }

  function handleIntroContinue() {
    requestAmbientAudioStart();
    setPhase((current) => (current === "introBrief" ? "walkingDate" : current));
  }

  function handleArrive(stop: JourneyStop) {
    setPhase((current) => {
      if (stop === "date" && current === "walkingDate") {
        return "arrivedDate";
      }

      if (stop === "dinner" && current === "walkingDinner") {
        return "arrivedDinner";
      }

      if (stop === "activity" && current === "walkingActivity") {
        return "arrivedActivity";
      }

      if (stop === "drinks" && current === "walkingDrinks") {
        return "arrivedDrinks";
      }

      return current;
    });
  }

  function handleBoardOpen() {
    requestAmbientAudioStart();
    datePromptOpenedRef.current = true;
    setPhase((current) => {
      if (
        current === "walkingDate" ||
        current === "arrivedDate" ||
        current === "selectingDate" ||
        current === "lockedDate"
      ) {
        return "selectingDate";
      }

      return current;
    });
  }

  function handleDinnerOpen() {
    requestAmbientAudioStart();
    setPhase((current) => {
      if (current === "arrivedDinner" || current === "lockedDinner") {
        return "selectingDinner";
      }

      return current;
    });
  }

  function handleActivityOpen() {
    requestAmbientAudioStart();
    setPhase((current) => {
      if (current === "arrivedActivity" || current === "lockedActivity") {
        return "selectingActivity";
      }

      return current;
    });
  }

  function handleDrinksOpen() {
    requestAmbientAudioStart();
    setPhase((current) => {
      if (current === "arrivedDrinks" || current === "lockedDrinks") {
        return "selectingDrinks";
      }

      return current;
    });
  }

  function handlePanelClose() {
    setPhase((current) => {
      if (current === "selectingDate") {
        return selectedDateId ? "lockedDate" : "arrivedDate";
      }

      if (current === "selectingDinner") {
        return selectedDinnerId ? "lockedDinner" : "arrivedDinner";
      }

      if (current === "selectingActivity") {
        return selectedActivityId ? "lockedActivity" : "arrivedActivity";
      }

      if (current === "selectingDrinks") {
        return selectedDrinksId ? "lockedDrinks" : "arrivedDrinks";
      }

      return current;
    });
  }

  function handleConfirmDate() {
    if (!selectedDateId) {
      return;
    }

    setPhase("lockedDate");
  }

  function handleConfirmDinner() {
    if (!selectedDinnerId) {
      return;
    }

    setPhase("lockedDinner");
  }

  function handleConfirmActivity() {
    if (!selectedActivityId) {
      return;
    }

    setPhase("lockedActivity");
  }

  function handleConfirmDrinks() {
    if (!selectedDrinksId) {
      return;
    }

    setPhase("lockedDrinks");
  }

  async function handleSend() {
    if (!selectedDate || !selectedDinner || !selectedActivity || !selectedDrinks) {
      return;
    }

    requestAmbientAudioStop();

    const summary = `${siteUrl}\n\nBuild-A-Date\nDate: ${selectedDate.label}\nDinner: ${selectedDinner.label}\nActivity: ${selectedActivity.label}\nDrinks: ${selectedDrinks.label}\n\nAll you have to do is show up.`;
    const userAgent = window.navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent);
    const smsNumber = "3149229048";

    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // Clipboard is just a soft fallback here.
    }

    setSubmitted(true);
    setPhase("submitted");

    if (isMobile) {
      const separator = isAppleMobile ? "&" : "?";
      window.location.href = `sms:${smsNumber}${separator}body=${encodeURIComponent(summary)}`;
    }
  }

  return (
    <main className="app-shell">
      <AmbientAudio />

      <div
        className={`scene-layer ${
          phase === "prologue"
            ? "scene-layer-visible scene-layer-title"
            : phase === "transition"
              ? "scene-layer-leaving scene-layer-title"
              : "scene-layer-hidden scene-layer-title"
        }`}
      >
        <TitlePrologue onBegin={handleStart} preparing={startRequested && !worldPrepared} />
      </div>

      <div
        className={`scene-layer ${
          phase === "prologue"
            ? "scene-layer-hidden scene-layer-world"
            : phase === "transition"
              ? "scene-layer-entering scene-layer-world"
              : "scene-layer-visible scene-layer-world"
        }`}
      >
        <WorldCanvas
          onActivityOpen={handleActivityOpen}
          onArrive={handleArrive}
          onBoardOpen={handleBoardOpen}
          onDinnerOpen={handleDinnerOpen}
          onDrinksOpen={handleDrinksOpen}
          onWorldReady={() => setWorldPrepared(true)}
          phase={phase}
          selectedActivityId={selectedActivityId}
          selectedDinnerId={selectedDinnerId}
          selectedDateId={selectedDateId}
          selectedDrinksId={selectedDrinksId}
          transitioning={phase === "transition"}
        />
      </div>

      {phase === "transition" ? (
        <div className="transition-veil" aria-hidden="true">
          <div className="transition-waterline" />
          <div className="transition-glow" />
          <div className="transition-city-haze" />
          <PetalOverlay count={10} variant="transition" />
        </div>
      ) : null}

      {phase === "introBrief" ? <WorldInstructions onContinue={handleIntroContinue} /> : null}

      {phase !== "prologue" &&
      phase !== "transition" &&
      phase !== "introBrief" &&
      phase !== "selectingDate" &&
      phase !== "selectingDinner" &&
      phase !== "selectingActivity" &&
      phase !== "selectingDrinks" &&
      phase !== "finalReveal" &&
      phase !== "submitted" ? (
        <OverlayText
          onDateOpen={handleBoardOpen}
          phase={phase}
          selectedActivityLabel={selectedActivity?.label ?? null}
          selectedDateLabel={selectedDate?.label ?? null}
          selectedDinnerLabel={selectedDinner?.label ?? null}
          selectedDrinksLabel={selectedDrinks?.label ?? null}
        />
      ) : null}

      {phase === "selectingDate" ? (
        <ChoicePanel
          compact
          confirmLabel="Keep this night"
          eyebrow="Main Street board"
          onClose={handlePanelClose}
          onConfirm={handleConfirmDate}
          onSelect={setSelectedDateId}
          options={dateOptions}
          panelCopy="Main Street kept the board lit for a reason. Swipe through the lit weekends, then tap the night that feels right."
          selectedId={selectedDateId}
          selectedNote="The city heard you clearly"
          title="First... pick the night."
          unselectedNote="Swipe the weekends, then tap one to wake the route."
        />
      ) : null}

      {phase === "selectingDinner" ? (
        <ChoicePanel
          compact
          confirmLabel="Set dinner here"
          eyebrow="Plaza dinner district"
          onClose={handlePanelClose}
          onConfirm={handleConfirmDinner}
          onSelect={setSelectedDinnerId}
          options={dinnerOptions}
          panelCopy="The city quieted down on purpose. Choose the table that feels like the night turning personal."
          selectedId={selectedDinnerId}
          selectedNote="This one looks good on the two of you"
          title="Then... we eat."
          tone="warm"
          unselectedNote="Let the district open up a little more, then choose where dinner belongs."
        />
      ) : null}

      {phase === "selectingActivity" ? (
        <ChoicePanel
          compact
          confirmLabel="Let this be the vibe"
          eyebrow="Power & Light district"
          onClose={handlePanelClose}
          onConfirm={handleConfirmActivity}
          onSelect={setSelectedActivityId}
          options={activityOptions}
          panelCopy="The city picked up a pulse, but it kept the room soft for the two of you. Choose how the night starts moving."
          panelClassName="choice-panel-activity"
          selectedId={selectedActivityId}
          selectedNote="The night found its rhythm here"
          title="Then... we set the vibe."
          unselectedNote="Let the district show you its pulse, then choose what feels right."
        />
      ) : null}

      {phase === "selectingDrinks" ? (
        <ChoicePanel
          compact
          confirmLabel="Keep the night here"
          eyebrow="Rooftop finale"
          onClose={handlePanelClose}
          onConfirm={handleConfirmDrinks}
          onSelect={setSelectedDrinksId}
          options={drinksOptions}
          panelCopy="The skyline saved the last word. Choose where the night settles, and let the city glow beneath you."
          panelClassName="choice-panel-rooftop"
          selectedId={selectedDrinksId}
          selectedNote="This is how the skyline would end it"
          title="One more stop."
          tone="warm"
          unselectedNote="Take a breath. The best ending is probably already in front of you."
          wrapClassName="panel-wrap-rooftop"
        />
      ) : null}

      {phase === "finalReveal" || phase === "submitted" ? (
        <FinalReveal
          onSend={handleSend}
          selectedActivityLabel={selectedActivity?.label ?? ""}
          selectedDateLabel={selectedDate?.label ?? ""}
          selectedDinnerLabel={selectedDinner?.label ?? ""}
          selectedDrinksLabel={selectedDrinks?.label ?? ""}
          submitted={submitted}
        />
      ) : null}
    </main>
  );
}
