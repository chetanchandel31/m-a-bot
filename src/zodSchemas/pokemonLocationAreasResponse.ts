import { z } from "zod";

const ZodEncounterConditionValue = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ZodEncounterMethod = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ZodEncounterDetails = z.object({
  min_level: z.number(),
  max_level: z.number(),
  condition_values: z.array(ZodEncounterConditionValue),
  chance: z.number(),
  method: ZodEncounterMethod,
});

const ZodVersion = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ZodVersionDetails = z.object({
  max_chance: z.number(),
  encounter_details: z.array(ZodEncounterDetails),
  version: ZodVersion,
});

const ZodLocationArea = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ZodPokemonEncounter = z.object({
  location_area: ZodLocationArea,
  version_details: z.array(ZodVersionDetails),
});

export const ZodSchemaPokemonLocationAreaResponse =
  z.array(ZodPokemonEncounter);
