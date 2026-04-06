export const routePoints = [
  [0.1, 0, 14],
  [0.18, 0, 8],
  [0.36, 0, 2],
  [0.58, 0, -6],
  [0.76, 0, -13.5],
  [0.92, 0, -20.2],
  [1.16, 0, -24.2],
  [1.54, 0, -30.2],
  [2.42, 0, -37],
  [3.18, 0, -43.8],
  [4.36, 0, -48.8],
  [5.2, 0, -53.7],
  [5.04, 0, -58.2],
  [3.7, 0, -62.1],
  [2.12, 0, -65.4],
  [1.08, 0, -68.4],
  [0.12, 0, -74.2],
  [-1.24, 0, -80.4],
  [-2.52, 0, -86.2],
  [-3.18, 0, -91.8],
  [-2.64, 0, -97.6],
  [-1.12, 0, -103.6],
  [0.96, 0.9, -109.2],
  [2.82, 1.9, -114.8],
  [4.48, 3.02, -120.6],
  [5.48, 4.04, -125.6],
  [6.1, 4.72, -129.4],
  [6.34, 4.9, -132.4]
] as const;

export const boardPosition = [4.15, 1.86, -29.2] as const;
export const boardPromptPosition = [3.74, -1.08, 0.42] as const;
export const dateFocusPosition = [3.88, 1.88, -29.4] as const;
export const dateRevealCameraPosition = [-0.18, 5.04, -37.3] as const;
export const dateRevealLookPosition = [3.36, 1.9, -29.18] as const;
export const dateStopCameraPosition = [0.08, 4.38, -36.5] as const;
export const dateStopLookPosition = [3.54, 1.86, -29.2] as const;
export const dinnerFocusPosition = [2.2, 1.92, -66.8] as const;
export const dinnerRevealCameraPosition = [0.42, 5.84, -51.2] as const;
export const dinnerRevealLookPosition = [1.96, 2.3, -71.8] as const;
export const dinnerStopCameraPosition = [0.88, 5.12, -56.6] as const;
export const dinnerStopLookPosition = [1.92, 2.18, -73.2] as const;
export const activityFocusPosition = [-1.24, 2.18, -100.6] as const;
export const activityRevealCameraPosition = [2.08, 6.02, -90.6] as const;
export const activityRevealLookPosition = [-1.12, 2.46, -108.9] as const;
export const activityStopCameraPosition = [1.34, 5.16, -94.8] as const;
export const activityStopLookPosition = [-1.14, 2.42, -109.1] as const;
export const drinksFocusPosition = [6.92, 5.54, -129.84] as const;
export const drinksRevealCameraPosition = [1.82, 8.96, -118.1] as const;
export const drinksRevealLookPosition = [6.34, 6.28, -149.2] as const;
export const drinksStopCameraPosition = [3.74, 7.42, -123.8] as const;
export const drinksStopLookPosition = [6.34, 6.18, -149.6] as const;
export const stopProgress = {
  date: 0.24,
  dinner: 0.5,
  activity: 0.73,
  drinks: 0.97,
  outro: 1
} as const;
export const sceneLength = 116;
