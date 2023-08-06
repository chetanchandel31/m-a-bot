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
  rate: z.number(),
  version: ZodVersion,
});

const ZodEncounterMethodRates = z.array(
  z.object({
    encounter_method: ZodEncounterMethod,
    version_details: z.array(ZodVersionDetails),
  })
);

const ZodLanguage = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ZodNames = z.array(
  z.object({
    name: z.string(),
    language: ZodLanguage,
  })
);

const ZodLocation = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ZodPokemon = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ZodPokemonEncounterDetails = z.object({
  version: ZodVersion,
  max_chance: z.number(),
  encounter_details: z.array(ZodEncounterDetails),
});

const ZodPokemonEncounters = z.array(
  z.object({
    pokemon: ZodPokemon,
    version_details: z.array(ZodPokemonEncounterDetails),
  })
);

export const ZodSchemaLocationAreaPokemonsResponse = z.object({
  id: z.number(),
  name: z.string(),
  game_index: z.number(),
  encounter_method_rates: ZodEncounterMethodRates,
  location: ZodLocation,
  names: ZodNames,
  pokemon_encounters: ZodPokemonEncounters,
});
