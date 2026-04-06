export type DinnerOption = {
  copy: string;
  id: string;
  label: string;
  shortLabel: string;
};

export const dinnerOptions: DinnerOption[] = [
  {
    id: "steakhouse",
    shortLabel: "Big Time",
    label: "An Upscale Steakhouse",
    copy: "You said big time... so we start here."
  },
  {
    id: "coopers-hawk",
    shortLabel: "You Already Know",
    label: "Cooper's Hawk",
    copy: "Somewhere you already know you like."
  },
  {
    id: "something-new",
    shortLabel: "Let Me Lead",
    label: "Something New",
    copy: "Let me put you onto something."
  },
  {
    id: "chef-boyardijon",
    shortLabel: "Chef BoyarDijon",
    label: "I cook for you",
    copy: "Or... I make this a different level."
  }
];
