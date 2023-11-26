export const ENUM_HEROES_RANK_DATA_COMMAND_OPTIONS = {
  RANK: "rank",
  METRIC: "metric",
} as const;

export const ENUM_RANK_OPTIONS = {
  ALL: "all",
  MYTHIC: "mythic",
  MYTHIC_PLUS: "mythic+",
} as const;

export type TypeRankOption =
  (typeof ENUM_RANK_OPTIONS)[keyof typeof ENUM_RANK_OPTIONS];

export const ENUM_RANK_DATA_METRICS = {
  USAGE: "usage",
  WIN_RATE: "win-rate",
  BAN_RATE: "ban-rate",
} as const;
export type TypeRankDataMetric =
  (typeof ENUM_RANK_DATA_METRICS)[keyof typeof ENUM_RANK_DATA_METRICS];
