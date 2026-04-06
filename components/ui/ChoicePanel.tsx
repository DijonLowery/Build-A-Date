"use client";

export type ChoicePanelOption = {
  copy: string;
  id: string;
  label: string;
  shortLabel: string;
};

type ChoicePanelProps = {
  compact?: boolean;
  confirmLabel: string;
  eyebrow: string;
  onClose: () => void;
  onConfirm: () => void;
  onSelect: (id: string) => void;
  options: readonly ChoicePanelOption[];
  panelCopy: string;
  selectedId: string | null;
  selectedNote: string;
  title: string;
  tone?: "cool" | "warm";
  unselectedNote: string;
};

export function ChoicePanel({
  compact = false,
  confirmLabel,
  eyebrow,
  onClose,
  onConfirm,
  onSelect,
  options,
  panelCopy,
  selectedId,
  selectedNote,
  title,
  tone = "cool",
  unselectedNote
}: ChoicePanelProps) {
  const selected = options.find((option) => option.id === selectedId) ?? null;

  return (
    <div className="panel-wrap">
      <div className={`choice-panel${tone === "warm" ? " choice-panel-warm" : ""}${compact ? " choice-panel-compact" : ""}`}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="text-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <p className="panel-copy">{panelCopy}</p>

        <div className={`date-grid${compact ? " date-grid-compact" : ""}`}>
          {options.map((option) => {
            const active = option.id === selectedId;

            return (
              <button
                className={`date-card${active ? " date-card-active" : ""}${tone === "warm" ? " date-card-warm" : ""}${compact ? " date-card-compact" : ""}`}
                key={option.id}
                onClick={() => onSelect(option.id)}
                type="button"
              >
                <span>{option.shortLabel}</span>
                <strong>{option.label}</strong>
                <small>{option.copy}</small>
              </button>
            );
          })}
        </div>

        <div className="panel-footer">
          {selected ? (
            <div className={`selection-note${tone === "warm" ? " selection-note-warm" : ""}`}>
              <span>{selectedNote}</span>
              <strong>{selected.label}</strong>
            </div>
          ) : (
            <div className="selection-note selection-note-muted">
              <span>{unselectedNote}</span>
            </div>
          )}

          <button className={`primary-button${tone === "warm" ? " primary-button-warm" : ""}`} disabled={!selected} onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
