import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { AnimeSearchResponse, Genre } from "src/types";
import {
  executeV2,
  getRelatedGenre,
  getTotalAnimeCount,
} from "../../commands/recommendAnime";
import { getAnime, GetAnimeQueryParams } from "../../helpers/getAnime";

const mockTotalAnimeCount = 12;

jest.mock("../../helpers/getAnime", () => {
  return {
    getAnime: jest
      .fn((queryParams?: GetAnimeQueryParams) => {
        const result: AnimeSearchResponse = {
          pagination: {
            last_visible_page: 0,
            has_next_page: false,
            current_page: 0,
            items: {
              count: mockTotalAnimeCount,
              total: 0,
              per_page: 0,
            },
          },
          data: [],
        };

        return Promise.resolve(result);
      })
      .mockName("getAnime"),
  };
});

type RecommendAnimeOptions = {
  genre: string;
  startDate: number | null;
  endDate: number | null;
};

function getMockInteraction(
  commandOptions: RecommendAnimeOptions = {
    genre: "2",
    startDate: null,
    endDate: null,
  }
) {
  const genreList: Genre[] = [
    { count: 5, mal_id: 1, name: "dummy", url: "xyz.com" },
    { count: 6, mal_id: 2, name: "dummy2", url: "xyz2.com" },
    { count: 6, mal_id: 12, name: "dummy4", url: "xyz4.com" },
  ];

  const mockInteraction: ChatInputCommandInteraction<CacheType> = {
    client: {
      initialFetchedData: {
        genreList,
      },
    },
    editReply: jest.fn().mockName("editReply"),
    options: {
      getString: jest.fn((name: string) => {
        if (name === "genre") return commandOptions.genre;
      }),
      getInteger: jest.fn((name: string) => {
        if (name === "start-date") return commandOptions.startDate;
        if (name === "end-date") return commandOptions.endDate;
      }),
    },
    deferReply: jest.fn(),
  } as unknown as ChatInputCommandInteraction<CacheType>;

  return mockInteraction;
}

describe("/recommend-anime genre startDate endDate", () => {
  // don't know if it will be valid or invalid genre but it is safe to assume `genre` will always be there because it is a required option
  // `startDate` and `endDate` will be optional options

  // different ways of using the command -> expected behaviours
  // genre (valid or invalid genre)
  // genre startDate
  // genre endDate
  // genre startDate? endDate
  // ├── genre sta?rtDate endDate (endDate  < startDate)

  test("it should initially show 'bot is thinking...', because we intend to make async operations and get back", async () => {
    const interaction = getMockInteraction();

    await executeV2(interaction);

    expect(interaction.deferReply).toHaveBeenCalled();
  });

  test("should call jikan-API when it gets valid genreId from option(user clicked on suggestion)", async () => {
    const interaction = getMockInteraction({
      genre: "1",
      startDate: null,
      endDate: null,
    });

    await executeV2(interaction);

    expect(getAnime).toBeCalledWith({ genres: "1", limit: 10 });
  });

  test("should call jikan-API when it gets valid genre name from option(user DID NOT click on suggestion but typed correct genre name)", async () => {
    const interaction = getMockInteraction({
      genre: "dummy2",
      startDate: null,
      endDate: null,
    });

    await executeV2(interaction);

    expect(getAnime).toBeCalledWith({ genres: "2", limit: 10 });
  });

  test("should use fuzzy search when reading user-typed genre, to allow some room for spelling error", async () => {
    const interaction = getMockInteraction({
      genre: "dumey",
      startDate: null,
      endDate: null,
    });

    await executeV2(interaction);

    expect(getAnime).toBeCalledWith({ genres: "1", limit: 10 });
  });

  test(`upon receiving invalid genre
  1. don't call jikan-API
  2. send some error message
  `, async () => {
    const interaction = getMockInteraction({
      genre: "some_name_that's_definitely_not_a_genre",
      endDate: null,
      startDate: null,
    });

    await executeV2(interaction);

    expect(getAnime).not.toBeCalled();
    expect(interaction.editReply).toBeCalledWith("no such genre found 🧐");
  });

  test("should be able to call jikan-API with `start-date`", async () => {
    const interaction = getMockInteraction({
      genre: "1",
      startDate: 2016,
      endDate: null,
    });

    await executeV2(interaction);

    expect(getAnime).toBeCalledWith({
      genres: "1",
      limit: 10,
      start_date: 2016,
    });
  });

  test("should be able to call jikan-API with `end-date`", async () => {
    const interaction = getMockInteraction({
      genre: "1",
      startDate: null,
      endDate: 2020,
    });

    await executeV2(interaction);

    expect(getAnime).toBeCalledWith({
      genres: "1",
      limit: 10,
      end_date: 2020,
    });
  });

  test("should be able to call jikan-API with `start-date` & `end-date`", async () => {
    const interaction = getMockInteraction({
      genre: "1",
      startDate: 2016,
      endDate: 2020,
    });

    await executeV2(interaction);

    expect(getAnime).toBeCalledWith({
      genres: "1",
      limit: 10,
      start_date: 2016,
      end_date: 2020,
    });
  });

  test("should send error message when `end-date` < `start-date` and should NOT even call jikan-API", async () => {
    const interaction = getMockInteraction({
      genre: "1",
      startDate: 2020,
      endDate: 2018,
    });

    await executeV2(interaction);

    expect(getAnime).not.toBeCalled();
    expect(interaction.editReply).toBeCalledWith(
      "invalid range, `start-date` shouldn't be greater than `end-date`"
    );
  });

  test.todo("should handle situation when total count is too low");

  test.todo("should handle situation when jikan api req fails");
  // const spy =jest
  // .spyOn(SoundPlayer, 'brand')
  // .mockImplementation(() => 'some-mocked-brand')

  // spy.mockRestore()
});

describe("getRelatedGenre", () => {
  test("should be able to return related genre using id", () => {
    const interaction = getMockInteraction({
      genre: "12",
      endDate: null,
      startDate: null,
    });
    const genre = getRelatedGenre(interaction);

    expect(genre).toEqual({
      count: 6,
      mal_id: 12,
      name: "dummy4",
      url: "xyz4.com",
    });
  });

  test("if no id matches with passed, should check name to find related genre, even if there is small spelling error", () => {
    const interaction = getMockInteraction({
      genre: "dumy4",
      endDate: null,
      startDate: null,
    });
    const genre = getRelatedGenre(interaction);

    expect(genre).toEqual({
      count: 6,
      mal_id: 12,
      name: "dummy4",
      url: "xyz4.com",
    });
  });
});

describe("getTotalAnimeCount", () => {
  test("should just return `totalCount` from genre when `start_date` or `end_date` not present. And don't make call to jikan API", async () => {
    const relatedGenre: Genre = {
      count: 6,
      mal_id: 2,
      name: "dummy2",
      url: "xyz2.com",
    };

    const totalAnimeCount = await getTotalAnimeCount({ relatedGenre });

    expect(totalAnimeCount).toBe(6);
    expect(getAnime).not.toBeCalled();
  });

  test("when `start_date` or `end_date` are present, make call to Jikan-API and return `totalCount` from there", async () => {
    const relatedGenre: Genre = {
      count: 6,
      mal_id: 2,
      name: "dummy2",
      url: "xyz2.com",
    };

    const totalAnimeCount = await getTotalAnimeCount({
      relatedGenre,
      start_date: 2016,
    });

    expect(totalAnimeCount).toBe(mockTotalAnimeCount);
    expect(getAnime).toBeCalled();
  });

  test.todo("handle situation when network req fails");
});
