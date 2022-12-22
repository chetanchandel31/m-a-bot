import {
  APIEmbed,
  APIEmbedField,
  JSONEncodable,
  SlashCommandBuilder,
} from "discord.js";
import { getFormattedScore } from "src/helpers/getFormattedScore";
import { isJikanError } from "src/helpers/isJikanError";
import {
  AnimeSearchResponse,
  JikanErrorResponse,
  SlashCommand,
} from "src/types";
import { request } from "undici";

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("search-anime")
    .setDescription("Search for any anime")
    .addStringOption((option) =>
      option
        .setName("anime-name")
        .setDescription("name of the anime you are looking for")
        .setRequired(true)
    ),
  // .addIntegerOption((option) =>
  //   option
  //     .setName("max-search-results")
  //     .setDescription("upto how many search results can bot send?")
  //     .addChoices(
  //       ...[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((choice) => ({
  //         value: choice,
  //         name: String(choice),
  //       }))
  //     )
  // )
  async execute(interaction) {
    await interaction.deferReply();
    const animeName = interaction.options.getString("anime-name") as string; // it is "required" option so will always be there

    const result = await request(
      `https://api.jikan.moe/v4/anime?letter=${encodeURIComponent(
        animeName
      )}&limit=10&order_by=popularity`
    );
    const data: AnimeSearchResponse | JikanErrorResponse =
      await result.body.json();

    if (isJikanError(data)) {
      return await interaction.editReply(
        "there was an error ``` " + data + " ```"
      );
    }

    const approvedAnime = data.data.filter((anime) => anime.approved);
    const totalResultsCount = approvedAnime.length;

    await interaction.editReply({
      content: `${totalResultsCount} results for ${"`" + animeName + "`"}`,
    });

    approvedAnime.reverse().forEach(async (anime, i) => {
      const fields: APIEmbedField[] = [
        {
          name: "Season",
          value: anime.season ?? "-",
          inline: true,
        },
        {
          name: "Titles",
          value:
            anime.titles.map((title) => `${title.title}`).join(", ") || "-",
          inline: true,
        },
        {
          name: "\u200b",
          value: "\u200b",
        },
        {
          name: "Episodes",
          value: String(anime.episodes ?? "-"),
          inline: true,
        },
        {
          name: "Duration",
          value: anime.duration ?? "-",
          inline: true,
        },
        {
          name: "Aired",
          value: anime.aired?.string + (anime.airing ? " (on-going)" : ""),
          inline: true,
        },
        {
          name: "Type",
          value: anime.type ?? "-",
          inline: true,
        },
        {
          name: "Source",
          value: anime.source ?? "-",
          inline: true,
        },
        {
          name: "Studio",
          value:
            anime.studios
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
            anime.genres
              .concat(anime.explicit_genres)
              .map((genre) => `${genre.name}`)
              .join(", ") || "-",
          inline: true,
        },

        {
          name: "Theme",
          value: anime.themes.map((theme) => `${theme.name}`).join(", ") || "-",
          inline: true,
        },
        {
          name: "Demographics",
          value:
            anime.demographics
              .map((demographic) => `${demographic.name}`)
              .join(", ") || "-",
          inline: true,
        },
        {
          name: "Rating",
          value: anime.rating ?? "-",
          inline: true,
        },
        {
          name: "Score",
          value: anime.score
            ? getFormattedScore(anime.score, anime.scored_by)
            : "-",
        },
      ];
      const embeds: (APIEmbed | JSONEncodable<APIEmbed>)[] = [
        {
          color: 0x57f287,
          author: {
            name: `Rank #${anime.rank ?? "-"} | Popularity #${
              anime.popularity ?? "-"
            }`,
          },
          title: `${anime.title ?? "-"}`,
          image: {
            url: anime.images.jpg.large_image_url,
          },
          fields,
          timestamp: new Date().toISOString(),
          url: anime.url,
        },
      ];

      if (anime.background) {
        embeds.push({
          color: 0xefff00,
          title: `Background`,
          description: anime.background.slice(0, 4000),
        });
      }

      await interaction.followUp({
        content: `**${totalResultsCount - i}** of **${totalResultsCount}**
***Synopsis*** (*${anime.title}*)
${"```" + anime.synopsis + "```"}
\u200b
`,
        embeds,
      });
    });
  },
};
