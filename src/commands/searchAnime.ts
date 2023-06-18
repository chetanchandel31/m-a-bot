import {
  ActionRowBuilder,
  APIEmbed,
  APIEmbedField,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  JSONEncodable,
  SlashCommandBuilder,
} from "discord.js";
import { getFormattedScore } from "../helpers/getFormattedScore";
import { isJikanError } from "../helpers/isJikanError";
import {
  AnimeSearchResponse,
  JikanErrorResponse,
  SlashCommand,
} from "src/types";
import { request } from "undici";

async function fetchAnimeByName({
  animeName,
  page,
}: {
  animeName: string;
  page: number;
}): Promise<AnimeSearchResponse | JikanErrorResponse> {
  const requestUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
    animeName
  )}&limit=10&order_by=popularity&page=${page}`;

  let data: AnimeSearchResponse | JikanErrorResponse;

  try {
    const result = await request(requestUrl);
    data = await result.body.json();
  } catch (error) {
    console.log("fetchAnimeByName", { error });

    data = {
      status: 0,
      type: "",
      message: "couldn't make request to " + requestUrl,
      error: "",
      report_url: "",
    };
  }

  return data;
}

function getEmbedsFromAnime(anime: AnimeSearchResponse["data"][0]) {
  const fields: APIEmbedField[] = [
    {
      name: "Season",
      value: anime.season ?? "-",
      inline: true,
    },
    {
      name: "Titles",
      value: anime.titles.map((title) => `${title.title}`).join(", ") || "-",
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

  return embeds;
}

export async function fetchAndListAnimePage({
  animeName,
  interaction,
  page,
}: {
  interaction:
    | ChatInputCommandInteraction<CacheType>
    | ButtonInteraction<CacheType>;
  animeName: string;
  page: number;
}) {
  await interaction.deferReply();
  const data = await fetchAnimeByName({ animeName, page });

  if (isJikanError(data)) {
    return await interaction.editReply(
      "there was an error ``` " + data.message + " ```"
    );
  }

  const approvedAnime = data.data.filter((anime) => anime.approved);
  const totalResultsCount = approvedAnime.length;

  await interaction.editReply({
    content: `${totalResultsCount} results for ${"`" + animeName + "`"}`,
  });

  approvedAnime.reverse().forEach(async (anime, i) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Visit MAL")
        .setStyle(ButtonStyle.Link)
        .setURL(anime.url)
    );

    await interaction.followUp({
      content: `**${totalResultsCount - i}** of **${totalResultsCount}**
***Synopsis*** (*${anime.title}*)
${
  "```" +
  (anime.synopsis ? anime.synopsis.slice(0, 1800) : "nothing found") +
  "```"
}
\u200b
`,
      embeds: getEmbedsFromAnime(anime),
      components: [row],
    });
  });

  const rows: BaseMessageOptions["components"] = [];

  if (data.pagination.has_next_page) {
    rows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Next page")
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`search-anime ${animeName}`)
      )
    );
  }

  await interaction.followUp({
    content: `Page: ${data.pagination.current_page}/${data.pagination.last_visible_page}`,
    components: rows,
  });
}

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
    const animeName = interaction.options.getString("anime-name") as string; // it is "required" option so will always be there

    await fetchAndListAnimePage({ animeName, interaction, page: 1 });
  },
};
