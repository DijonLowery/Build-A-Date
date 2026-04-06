export type DateOption = {
  copy: string;
  id: string;
  iso: string;
  label: string;
  shortLabel: string;
};

const EXCLUDED_WEEKEND = new Set(["2026-04-24", "2026-04-25", "2026-04-26"]);
const MAX_OPTIONS = 12;

const weekdayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const fullLabel = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  weekday: "long"
});
const shortLabel = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short"
});

const FRIDAY_COPIES = [
  "A Friday that feels worth dressing for.",
  "A Friday night with a little spark already in it.",
  "A Friday built for slipping into something nice.",
  "A Friday that starts the weekend the right way."
] as const;

const SATURDAY_COPIES = [
  "Weekend energy without rushing it.",
  "A Saturday made for taking our time.",
  "A Saturday that leaves room for a little magic.",
  "A Saturday night with nowhere better to be."
] as const;

const SUNDAY_COPIES = [
  "A Sunday that still leaves room for something beautiful.",
  "A Sunday evening soft enough to linger in.",
  "A Sunday that feels easy in the best way.",
  "A Sunday worth stretching just a little longer."
] as const;

function formatIso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildCopy(date: Date) {
  const day = date.getDay();
  const weekIndex = Math.floor((date.getDate() - 1) / 7);

  if (day === 5) {
    return FRIDAY_COPIES[weekIndex % FRIDAY_COPIES.length];
  }

  if (day === 6) {
    return SATURDAY_COPIES[weekIndex % SATURDAY_COPIES.length];
  }

  return SUNDAY_COPIES[weekIndex % SUNDAY_COPIES.length];
}

function isEligibleNight(date: Date) {
  const iso = formatIso(date);
  const day = date.getDay();

  return (day === 5 || day === 6 || day === 0) && !EXCLUDED_WEEKEND.has(iso);
}

function buildDateOptions() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const options: DateOption[] = [];

  for (let offset = 0; offset < 120 && options.length < MAX_OPTIONS; offset += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);

    if (!isEligibleNight(date)) {
      continue;
    }

    const iso = formatIso(date);
    const weekday = weekdayLabel.format(date).toLowerCase().slice(0, 3);
    const short = shortLabel.format(date).replace(".", "");

    options.push({
      copy: buildCopy(date),
      id: `${weekday}-${short.toLowerCase().replace(/\s+/g, "-")}`,
      iso,
      label: fullLabel.format(date),
      shortLabel: short
    });
  }

  return options;
}

export const dateOptions: DateOption[] = buildDateOptions();
