export const getFormattedScore = (score: number, scored_by: number) =>
  "⭐".repeat(Math.round(score)) +
  "⚫".repeat(10 - Math.round(score)) +
  +" " +
  score +
  "/10" +
  "\n" +
  `(scored by ${scored_by} users)`;
