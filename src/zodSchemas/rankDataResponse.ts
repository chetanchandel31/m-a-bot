import { z } from "zod";

const HeroSchema = z.object({
  id: z.number(),
  use: z.string(),
  win: z.string(),
  ban: z.string(),
  avatar: z.string(),
  name: z.string(),
});

const DataSchema = z.object({
  data: z.array(HeroSchema),
  time: z.string(),
});

export const ZodSchemaRankData = z.object({
  status: z.literal("success"),
  code: z.number(),
  data: DataSchema,
});

export type TypeRankData = z.infer<typeof ZodSchemaRankData>;
