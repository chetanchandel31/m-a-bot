import {
  APIEmbed,
  APIEmbedField,
  JSONEncodable,
  SlashCommandBuilder,
} from "discord.js";
import Fuse from "fuse.js";
import { getFormattedScore } from "src/helpers/getFormattedScore";
import { isJikanError } from "src/helpers/isJikanError";
import {
  AnimeSearchResponse,
  CustomClient,
  JikanErrorResponse,
  SlashCommand,
} from "src/types";
import { request } from "undici";

const getRandomNum = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("recommend-anime")
    .setDescription("Recommends random anime based on a genre")
    .addStringOption((option) =>
      option
        .setName("genre")
        .setDescription("What genre anime should get recommended?")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const interactionClient = interaction.client as CustomClient;

    const focusedValue = interaction.options.getFocused();
    const choices = interactionClient.initialFetchedData?.genreList ?? [];

    const fuse = new Fuse(choices, {
      keys: ["name"],
      threshold: 0.4,
    });

    const filtered = focusedValue
      ? fuse.search(focusedValue).map(({ item }) => item)
      : choices;

    await interaction.respond(
      filtered
        .map((choice) => ({
          name: choice.name + ` (${choice.count})`,
          value: String(choice.mal_id),
        }))
        .slice(0, 25)
    );
  },
  async execute(interaction) {
    await interaction.deferReply();

    const interactionClient = interaction.client as CustomClient;

    const genreId = interaction.options.getString("genre") as string;
    const relatedGenre = interactionClient.initialFetchedData?.genreList.find(
      (genre) => String(genre.mal_id) === genreId
    );

    if (!relatedGenre) {
      return await interaction.editReply("no such genre found");
    }

    // random page-number based on `relatedGenre.count`
    const perPage = 10;
    const totalPageCount = Math.round(relatedGenre.count / perPage);
    const randomPage = getRandomNum(1, totalPageCount);

    const result = await request(
      `https://api.jikan.moe/v4/anime?genres=${genreId}&page=${randomPage}&limit=${perPage}`
    );
    const data: AnimeSearchResponse | JikanErrorResponse =
      await result.body.json();

    if (isJikanError(data)) {
      return await interaction.editReply(
        "there was an error ``` " + data + " ```"
      );
    }

    const approvedAnime = data.data.filter((anime) => anime.approved);

    if (approvedAnime.length < 1) {
      return interaction.editReply("try again");
    }

    // random number based on approved anime on current page
    const randomAnimeIndex = getRandomNum(0, approvedAnime.length - 1);
    const randomAnime = approvedAnime[randomAnimeIndex];

    // prepare and send embed
    const fields: APIEmbedField[] = [
      {
        name: "Season",
        value: randomAnime.season ?? "-",
        inline: true,
      },
      {
        name: "Titles",
        value:
          randomAnime.titles.map((title) => `${title.title}`).join(", ") || "-",
        inline: true,
      },
      {
        name: "\u200b",
        value: "\u200b",
      },
      {
        name: "Episodes",
        value: String(randomAnime.episodes ?? "-"),
        inline: true,
      },
      {
        name: "Duration",
        value: randomAnime.duration ?? "-",
        inline: true,
      },
      {
        name: "Aired",
        value:
          randomAnime.aired?.string + (randomAnime.airing ? " (on-going)" : ""),
        inline: true,
      },
      {
        name: "Type",
        value: randomAnime.type ?? "-",
        inline: true,
      },
      {
        name: "Source",
        value: randomAnime.source ?? "-",
        inline: true,
      },
      {
        name: "Studio",
        value:
          randomAnime.studios
            .map((studio) => `${studio.name} (${studio.type})`)
            .join(", ") || "-",
        inline: true,
      },
      {
        name: "\u200b",
        value: "\u200b",
      },
      {
        name: "Genre",
        value:
          randomAnime.genres
            .concat(randomAnime.explicit_genres)
            .map((genre) => `${genre.name}`)
            .join(", ") || "-",
        inline: true,
      },
      {
        name: "Theme",
        value:
          randomAnime.themes.map((theme) => `${theme.name}`).join(", ") || "-",
        inline: true,
      },
      {
        name: "Demographics",
        value:
          randomAnime.demographics
            .map((demographic) => `${demographic.name}`)
            .join(", ") || "-",
        inline: true,
      },
      {
        name: "Rating",
        value: randomAnime.rating ?? "-",
        inline: true,
      },
      {
        name: "Score",
        value: randomAnime.score
          ? getFormattedScore(randomAnime.score, randomAnime.scored_by)
          : "-",
      },
    ];
    const embeds: (APIEmbed | JSONEncodable<APIEmbed>)[] = [
      {
        color: 15418782,
        author: {
          name: `Rank #${randomAnime.rank ?? "-"} | Popularity #${
            randomAnime.popularity ?? "-"
          }`,
        },
        title: `${randomAnime.title ?? "-"}`,
        image: {
          url: randomAnime.images.jpg.large_image_url,
        },
        fields,
        timestamp: new Date().toISOString(),
        url: randomAnime.url,
      },
    ];

    if (randomAnime.background) {
      embeds.push({
        color: 0xefff00,
        title: `Background`,
        description: randomAnime.background.slice(0, 4000),
      });
    }

    await interaction.followUp({
      content: `
Random **${relatedGenre.name}** anime:

***Synopsis*** (*${randomAnime.title}*)
${"```" + randomAnime.synopsis + "```"}
\u200b
`,
      embeds,
    });
  },
};
