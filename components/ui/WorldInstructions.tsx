"use client";

type WorldInstructionsProps = {
  onContinue: () => void;
};

const instructionRows = [
  "This is Madison and Dijon. The two of you are already in the city together.",
  "Take my hand and let the lights lead. When a place begins to glow, touch it and see what the night is offering.",
  "You do not have to steer anything hard. Just choose what feels right and let the city carry the rest."
] as const;

export function WorldInstructions({ onContinue }: WorldInstructionsProps) {
  return (
    <div className="panel-wrap panel-wrap-intro">
      <div className="choice-panel world-instructions-panel">
        <div className="panel-header panel-header-intro">
          <div>
            <p className="eyebrow">Before we step into it</p>
            <h2>Take my hand.</h2>
          </div>
        </div>

        <p className="panel-copy world-instructions-copy">
          Kansas City is leading tonight, but gently. This is not a game to steer through. It is a guided walk, and
          Dijon keeps showing Madison the next part of the night.
        </p>

        <div className="world-instructions-list">
          {instructionRows.map((line) => (
            <div className="world-instructions-row" key={line}>
              <span />
              <p>{line}</p>
            </div>
          ))}
        </div>

        <button className="primary-button world-instructions-button" onClick={onContinue} type="button">
          Take my hand
        </button>
      </div>
    </div>
  );
}
