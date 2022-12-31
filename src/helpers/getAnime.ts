import { AnimeSearchResponse, JikanErrorResponse } from "src/types";
import { request } from "undici";

export type GetAnimeQueryParams = {
  genres?: string;
  page?: number;
  limit?: number;
  start_date?: number;
  end_date?: number;
};

export const getAnime = async (
  queryParams?: GetAnimeQueryParams
): Promise<AnimeSearchResponse | JikanErrorResponse> => {
  let baseUrl = "https://api.jikan.moe/v4/anime";

  if (queryParams) {
    let stringifiedQueryParams: string[] = [];

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) stringifiedQueryParams.push(`${key}=${value}`);
    });

    baseUrl = baseUrl + "?" + stringifiedQueryParams.join("&");
  }

  let data: AnimeSearchResponse | JikanErrorResponse;

  try {
    const result = await request(baseUrl);

    data = await result.body.json();
  } catch (error) {
    console.log("getAnime", error);
    data = {
      status: 0,
      type: "",
      message: "something went wrong while making request to: " + baseUrl,
      error: "something went wrong while making request to: " + baseUrl,
      report_url: "",
    };
  }

  return data;
};
