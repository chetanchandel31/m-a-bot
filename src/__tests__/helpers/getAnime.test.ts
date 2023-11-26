import { expect, jest, test } from "@jest/globals";
import { AnimeSearchResponse } from "../../types";
import { request } from "undici";
import { getAnime } from "../../helpers/getAnime";
import { isJikanError } from "../../helpers/isJikanError";

function mockRequest() {
  const result: AnimeSearchResponse = {
    pagination: {
      last_visible_page: 0,
      has_next_page: false,
      current_page: 0,
      items: {
        count: 0,
        total: 0,
        per_page: 0,
      },
    },
    data: [],
  };

  return Promise.resolve({
    body: { json: () => Promise.resolve(result) },
  });
}

jest.mock("undici", () => {
  return {
    request: jest.fn(mockRequest),
  };
});

test("can call undici's `request` with base url", () => {
  getAnime();

  expect(request).toBeCalledWith("https://api.jikan.moe/v4/anime");
});

test("can call undici's `request` with base url and 1 query param ", () => {
  getAnime({ limit: 10 });

  expect(request).toBeCalledWith("https://api.jikan.moe/v4/anime?limit=10");
});

test("shouldn't make call to incorrect url if a query is passed as `undefiend`", () => {
  getAnime({ limit: 10, start_date: undefined });

  expect(request).toBeCalledWith("https://api.jikan.moe/v4/anime?limit=10");
});

test("can call undici's `request` with base url and multiple query param ", () => {
  getAnime({ limit: 10, page: 4, genres: "1234", start_date: 2018 });

  expect(request).toBeCalledWith(
    "https://api.jikan.moe/v4/anime?limit=10&page=4&genres=1234&start_date=2018"
  );
});

test("even if request throws an error, wrapper should handle it and return JikanError", async () => {
  (request as jest.Mock).mockImplementationOnce(() => new Error("oops"));

  const result = await getAnime({ limit: 10, start_date: undefined });

  expect(isJikanError(result)).toBe(true);
});
