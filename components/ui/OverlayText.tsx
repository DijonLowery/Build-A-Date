"use client";

type OverlayTextProps = {
  phase:
    | "walkingDate"
    | "arrivedDate"
    | "selectingDate"
    | "lockedDate"
    | "leavingDate"
    | "walkingDinner"
    | "arrivedDinner"
    | "selectingDinner"
    | "lockedDinner"
    | "walkingActivity"
    | "arrivedActivity"
    | "selectingActivity"
    | "lockedActivity"
    | "walkingDrinks"
    | "arrivedDrinks"
    | "selectingDrinks"
    | "lockedDrinks";
  selectedActivityLabel?: string | null;
  selectedDinnerLabel?: string | null;
  selectedDateLabel?: string | null;
  selectedDrinksLabel?: string | null;
  onDateOpen?: () => void;
};

export function OverlayText({
  phase,
  onDateOpen,
  selectedActivityLabel,
  selectedDateLabel,
  selectedDinnerLabel,
  selectedDrinksLabel
}: OverlayTextProps) {
  if (phase === "walkingDate") {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip">
          <span>Main Street / KC Streetcar</span>
          <strong>The first turn of the night is glowing ahead.</strong>
        </div>
      </div>
    );
  }

  if (phase === "arrivedDate") {
    return (
      <div className="overlay overlay-floating overlay-floating-date">
        <button className="floating-chip floating-chip-date floating-chip-action" onClick={onDateOpen} type="button">
          <span>First stop</span>
          <strong>Tap to choose the night.</strong>
        </button>
      </div>
    );
  }

  if (phase === "lockedDate" && selectedDateLabel) {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip">
          <span>The night has a shape now</span>
          <strong>{selectedDateLabel}. The city is warming up ahead.</strong>
        </div>
      </div>
    );
  }

  if (phase === "leavingDate") {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip">
          <span>A little further</span>
          <strong>Let Main Street fall behind you. Something warmer is waiting.</strong>
        </div>
      </div>
    );
  }

  if (phase === "lockedDinner" && selectedDinnerLabel) {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip floating-chip-warm">
          <span>Dinner looks good in this light</span>
          <strong>{selectedDinnerLabel}</strong>
        </div>
      </div>
    );
  }

  if (phase === "walkingActivity") {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip">
          <span>A little deeper downtown</span>
          <strong>The city found its pulse. A live set is waiting just ahead.</strong>
        </div>
      </div>
    );
  }

  if (phase === "lockedActivity" && selectedActivityLabel) {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip">
          <span>The night found its rhythm</span>
          <strong>{selectedActivityLabel}</strong>
        </div>
      </div>
    );
  }

  if (phase === "walkingDrinks") {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip floating-chip-warm">
          <span>Take it a little higher</span>
          <strong>The city is carrying you upstairs now. The skyline is opening in front of you.</strong>
        </div>
      </div>
    );
  }

  if (phase === "lockedDrinks" && selectedDrinksLabel) {
    return (
      <div className="overlay overlay-floating">
        <div className="floating-chip floating-chip-warm">
          <span>The city looks good from here</span>
          <strong>{selectedDrinksLabel}. Two glasses, one skyline.</strong>
        </div>
      </div>
    );
  }

  return null;
}
