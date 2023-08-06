import { request } from "undici";
import { z } from "zod";
import { ZodSchemaLocationAreaPokemonsResponse } from "../zodSchemas/locationAreaPokemonsResponse";

type Params = {
  locationAreaName: string;
};

export type InterfaceLocationAreaPokemonsResponse = z.infer<
  typeof ZodSchemaLocationAreaPokemonsResponse
>;

type Result =
  | { isError: true; title: string; details: Object }
  | {
      isError: false;
      data: InterfaceLocationAreaPokemonsResponse;
    };

export const getLocationAreaPokemons = async ({ locationAreaName }: Params) => {
  let reqUrl = `https://pokeapi.co/api/v2/location-area/${locationAreaName}/`;

  let result: Result = {
    isError: true,
    title: "Unknown",
    details: {},
  };

  try {
    const apiResponse = await request(reqUrl);
    const apiResponseBody = await apiResponse.body.json();
    const schemaValidationResult =
      ZodSchemaLocationAreaPokemonsResponse.safeParse(apiResponseBody);

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
