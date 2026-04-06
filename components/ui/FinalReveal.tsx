"use client";

type FinalRevealProps = {
  onSend: () => void;
  selectedActivityLabel: string;
  selectedDateLabel: string;
  selectedDinnerLabel: string;
  selectedDrinksLabel: string;
  submitted: boolean;
};

export function FinalReveal({
  onSend,
  selectedActivityLabel,
  selectedDateLabel,
  selectedDinnerLabel,
  selectedDrinksLabel,
  submitted
}: FinalRevealProps) {
  const rows = [
    { label: "Night", value: selectedDateLabel },
    { label: "Dinner", value: selectedDinnerLabel },
    { label: "Vibe", value: selectedActivityLabel },
    { label: "Drinks", value: selectedDrinksLabel }
  ];

  return (
    <div className="panel-wrap final-reveal-wrap">
      <div className="choice-panel choice-panel-warm final-reveal-panel">
        <div className="panel-header final-reveal-header">
          <div>
            <p className="eyebrow">Rooftop finale</p>
            <h2>Your night is set.</h2>
          </div>
        </div>

        <p className="panel-copy final-reveal-copy">
          The city softened itself all the way down to this. All you have to do is show up.
        </p>

        <div className="final-reveal-grid">
          {rows.map((row) => (
            <div className="final-reveal-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>

        <div className="selection-note selection-note-warm final-reveal-note">
          <span>The night is waiting</span>
          <strong>{submitted ? "Say less. I got it from here." : "Quietly magical. Barely finished. Exactly right."}</strong>
        </div>

        <button className="primary-button primary-button-warm final-reveal-button" onClick={onSend} type="button">
          {submitted ? "Ready to send again" : "Send it to Dijon"}
        </button>
      </div>
    </div>
  );
}
