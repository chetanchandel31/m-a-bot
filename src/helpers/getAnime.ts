import { AnimeSearchResponse, JikanErrorResponse } from "src/types";
import { request } from "undici";

export type GetAnimeQueryParams = {
  genres?: string;
  page?: number;
  limit?: number;
};

export const getAnime = async (
  queryParams?: GetAnimeQueryParams
): Promise<AnimeSearchResponse | JikanErrorResponse> => {
  let baseUrl = "https://api.jikan.moe/v4/anime";

  if (queryParams) {
    let stringifiedQueryParams: string[] = [];

    Object.entries(queryParams).forEach(([key, value]) => {
      stringifiedQueryParams.push(`${key}=${value}`);
    });

    baseUrl = baseUrl + "?" + stringifiedQueryParams.join("&");
  }

  const result = await request(baseUrl);

  const data: AnimeSearchResponse | JikanErrorResponse =
    await result.body.json();

  return data;
};
