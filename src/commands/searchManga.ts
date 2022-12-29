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
import { JikanErrorResponse, SlashCommand } from "src/types";
import { request } from "undici";

interface MangaSearchResponse {
  pagination: Pagination;
  data: Datum[];
}

interface Datum {
  mal_id: number;
  url: string;
  images: { jpg: Image; webp: Image };
  approved: boolean;
  titles: Title[];
  title: string;
  title_english: null | string;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  chapters: number;
  volumes: number | null;
  status: string;
  publishing: boolean;
  published: Published;
  score: number;
  scored: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: null | string;
  background: null | string;
  authors: Author[];
  serializations: Author[];
  genres: Author[];
  explicit_genres: Author[];
  themes: Author[];
  demographics: Author[];
}

interface Author {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

interface Image {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

interface Published {
  from: Date;
  to: Date | null;
  prop: Prop;
  string: string;
}

interface Prop {
  from: From;
  to: From;
}

interface From {
  day: number | null;
  month: number | null;
  year: number | null;
}

interface Title {
  type: string;
  title: string;
}

interface Pagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: Items;
}

interface Items {
  count: number;
  total: number;
  per_page: number;
}

async function fetchMangasByName({
  mangaName,
  page,
}: {
  mangaName: string;
  page: number;
}): Promise<MangaSearchResponse | JikanErrorResponse> {
  const requestUrl = `https://api.jikan.moe/v4/manga?letter=${encodeURIComponent(
    mangaName
  )}&limit=10&order_by=popularity&page=${page}`;

  let data: MangaSearchResponse | JikanErrorResponse;

  try {
    const result = await request(requestUrl);
    data = await result.body.json();
  } catch (error) {
    console.log("fetchMangaByName", { error });

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

function getEmbedsFromManga(manga: MangaSearchResponse["data"][0]) {
  const fields: APIEmbedField[] = [
    {
      name: "Titles",
      value: manga.titles.map((title) => `${title.title}`).join(", ") || "-",
      inline: true,
    },
    {
      name: "\u200b",
      value: "\u200b",
    },
    {
      name: "Chapters",
      value: String(manga.chapters ?? "-"),
      inline: true,
    },
    {
      name: "Volumes",
      value: String(manga.volumes ?? "-"),
      inline: true,
    },
    {
      name: "Aired",
      value: manga.published.string + (manga.publishing ? " (on-going)" : ""),
      inline: true,
    },
    {
      name: "Type",
      value: manga.type ?? "-",
      inline: true,
    },
    {
      name: "Author(s)",
      value:
        manga.authors
          .map((author) => `${author.name} (${author.type})`)
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
        manga.genres
          .concat(manga.explicit_genres)
          .map((genre) => `${genre.name}`)
          .join(", ") || "-",
      inline: true,
    },
    {
      name: "Theme",
      value: manga.themes.map((theme) => `${theme.name}`).join(", ") || "-",
      inline: true,
    },
    {
      name: "Demographics",
      value:
        manga.demographics
          .map((demographic) => `${demographic.name}`)
          .join(", ") || "-",
      inline: true,
    },
    {
      name: "Serialisations",
      value:
        manga.serializations
          .map((serialization) => `${serialization.name}`)
          .join(", ") || "-",
      inline: true,
    },
    {
      name: "Score",
      value: manga.score
        ? getFormattedScore(manga.score, manga.scored_by)
        : "-",
    },
  ];

  const embeds: (APIEmbed | JSONEncodable<APIEmbed>)[] = [
    {
      color: 0x57f287,
      author: {
        name: `Rank #${manga.rank} | Popularity #${manga.popularity}`,
      },
      title: `${manga.title}`,
      image: {
        url: manga.images.jpg.large_image_url,
      },
      fields,
      timestamp: new Date().toISOString(),
      url: manga.url,
    },
  ];

  if (manga.background) {
    embeds.push({
      color: 0xefff00,
      title: `Background`,
      description: manga.background.slice(0, 4000),
    });
  }

  return embeds;
}

export async function fetchAndListMangaPage({
  mangaName,
  interaction,
  page,
}: {
  interaction:
    | ChatInputCommandInteraction<CacheType>
    | ButtonInteraction<CacheType>;
  mangaName: string;
  page: number;
}) {
  await interaction.deferReply();

  const data: MangaSearchResponse | JikanErrorResponse =
    await fetchMangasByName({ mangaName, page });

  if (isJikanError(data)) {
    return await interaction.editReply(
      "there was an error ``` " + data + " ```"
    );
  }

  const approvedMangas = data.data.filter((manga) => manga.approved);
  const totalResultsCount = approvedMangas.length;

  await interaction.editReply({
    content: `${totalResultsCount} results for ${"`" + mangaName + "`"}`,
  });

  approvedMangas.reverse().forEach(async (manga, i) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Visit MAL")
        .setStyle(ButtonStyle.Link)
        .setURL(manga.url)
    );

    await interaction.followUp({
      content: `**${totalResultsCount - i}** of **${totalResultsCount}**
***Synopsis*** (*${manga.title}*)
${
  "```" +
  (manga.synopsis ? manga.synopsis.slice(0, 1800) : "nothing found") +
  "```"
}
\u200b
`,
      embeds: getEmbedsFromManga(manga),
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
          .setCustomId(`search-manga ${mangaName}`)
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
    .setName("search-manga")
    .setDescription("Search for any manga, manhwa, lightnovel etc")
    .addStringOption((option) =>
      option
        .setName("manga-name")
        .setDescription("name of the manga you are looking for")
        .setRequired(true)
    ),
  async execute(interaction) {
    const mangaName = interaction.options.getString("manga-name") as string; // it is "required" option so will always be there

    await fetchAndListMangaPage({ interaction, mangaName, page: 1 });
  },
};
