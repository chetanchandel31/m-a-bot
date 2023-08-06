import { AnimeSearchResponse, JikanErrorResponse } from "src/types";
import { ZodSchemaPokemonLocationAreaResponse } from "../zodSchemas/pokemonLocationAreasResponse";
import { request } from "undici";
import { z } from "zod";

type Params = {
  pokemonName: string;
};

export type InterfacePokemonLocationAreaResponse = z.infer<
  typeof ZodSchemaPokemonLocationAreaResponse
>;

type Result =
  | { isError: true; title: string; details: Object }
  | {
      isError: false;
      data: InterfacePokemonLocationAreaResponse;
    };

export const getPokemonLocationAreas = async ({ pokemonName }: Params) => {
  let reqUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}/encounters`;

  let result: Result = {
    isError: true,
    title: "Unknown",
    details: {},
  };

  try {
    const apiResponse = await request(reqUrl);
    const apiResponseBody = await apiResponse.body.json();
    const schemaValidationResult =
      ZodSchemaPokemonLocationAreaResponse.safeParse(apiResponseBody);

    if (schemaValidationResult.success) {
      result = {
        isError: false,
        data: schemaValidationResult.data,
      };
    } else {
      const errorDetails = schemaValidationResult.error.flatten();
      result = {
        isError: true,
        title: "schema validation failed",
        details: errorDetails,
      };
    }
  } catch (error: any) {
    if (error?.message) {
      result = {
        isError: true,
        title: error?.message || "",
        details: JSON.parse(JSON.stringify(error)),
      };
    }
  }

  return result;
};
