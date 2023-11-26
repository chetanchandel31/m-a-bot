import { request } from "undici";
import { TypeResult } from "../../types";
import {
  TypeRankData,
  ZodSchemaRankData,
} from "../../zodSchemas/rankDataResponse";
import { ZodError } from "zod";

type Params = {
  rank?: "all" | "mythic" | "mythic+";
};

export const fetchRankData = async ({ rank = "all" }: Params) => {
  let result: TypeResult<TypeRankData>;

  let type: number = 0;
  if (rank === "mythic") type = 1;
  else if (rank === "mythic+") type = 2;

  try {
    const rankData = await request(
      "https://api.mobilelegends.com/m/hero/getRankData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lang: "en",
          type,
          language: "en",
        }),
      }
    );
    const parsedRankData = await rankData.body.json();

    result = {
      isSuccess: true,
      result: ZodSchemaRankData.parse(parsedRankData),
    };
  } catch (error) {
    if (error instanceof Error || error instanceof ZodError) {
      result = {
        isSuccess: false,
        error: error,
        errorMessage: error.message,
      };
    } else {
      result = {
        isSuccess: false,
        errorMessage: "Unknown error",
      };
    }
  }

  return result;
};
