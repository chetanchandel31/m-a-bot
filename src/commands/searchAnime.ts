import { APIEmbedField, SlashCommandBuilder } from "discord.js";
import {
  AnimeSearchResponse,
  JikanErrorResponse,
  SlashCommand,
} from "src/types";
import { request } from "undici";

const isJikanError = (data: unknown): data is JikanErrorResponse =>
  !!data && typeof data === "object" && "error" in data;

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
  async execute(interaction) {
    await interaction.deferReply();
    const animeName = interaction.options.getString("anime-name") as string; // it is "required" option so will always be there

    const heroDetailsResult = await request(
      `https://api.jikan.moe/v4/anime?letter=${encodeURIComponent(
        animeName
      )}&limit=10`
    );
    const data: AnimeSearchResponse | JikanErrorResponse =
      await heroDetailsResult.body.json();

    if (isJikanError(data)) {
      return await interaction.editReply(
        "there was an error ``` " + data + " ```"
      );
    }

    const totalResultsCount = data.data.filter(
      (anime) => anime.approved
    ).length;

    await interaction.editReply({
      content: `${totalResultsCount} results for ${"`" + animeName + "`"}`,
    });

    // dedicate an entire embed to background and see if it crashes
    data.data.forEach(async (anime, i) => {
      if (!anime.approved) return;

      const fields: APIEmbedField[] | undefined = [
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
          value: anime.duration,
          inline: true,
        },
        {
          name: "Aired",
          value: anime.aired.string + (anime.airing ? " (on-going)" : ""),
          inline: true,
        },
        {
          name: "Type",
          value: anime.type,
          inline: true,
        },
        {
          name: "Source",
          value: anime.source,
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
          value: anime.rating,
          inline: true,
        },
        {
          name: "Score",
          value:
            "⭐".repeat(Math.round(anime.score)) +
            "⚫".repeat(10 - Math.round(anime.score)) +
            +" " +
            anime.score +
            "/10" +
            "\n" +
            `(scored by ${anime.scored_by} users)`,
        },
      ];

      await interaction.followUp({
        content: `**${i + 1}** of **${totalResultsCount}**
***Synopsis*** (*${anime.title}*)
${"```" + anime.synopsis + "```"}
\u200b
${
  anime.background
    ? "```" +
      anime.background?.slice(0, 470) +
      (anime.background.length > 470 ? "..." : "") +
      "```" +
      "\u200b"
    : ""
}
`,
        embeds: [
          {
            color: 0xefff00,
            author: {
              name: `Rank #${anime.rank} | Popularity #${anime.popularity}`,
            },
            title: `${anime.title} (${anime.title_japanese})`,
            image: {
              url: anime.images.jpg.large_image_url,
            },
            fields,
            timestamp: new Date().toISOString(),
            url: anime.url,
          },
        ],
      });
    });
  },
};
