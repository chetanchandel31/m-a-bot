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
import { isJikanError } from "../helpers/isJikanError";
import { request } from "undici";
import { JikanErrorResponse, SlashCommand } from "../types";

export interface CharacterSearchResponse {
  pagination: Pagination;
  data: Datum[];
}

export interface Datum {
  mal_id: number;
  url: string;
  images: Images;
  name: string;
  name_kanji: string;
  nicknames: string[];
  favorites: number;
  about: string;
}

export interface Images {
  jpg: Jpg;
  webp: Webp;
}

export interface Jpg {
  image_url: string;
}

export interface Webp {
  image_url: string;
  small_image_url: string;
}

export interface Pagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: Items;
}

export interface Items {
  count: number;
  total: number;
  per_page: number;
}

async function fetchCharacterByName({
  characterName,
  page,
}: {
  characterName: string;
  page: number;
}): Promise<CharacterSearchResponse | JikanErrorResponse> {
  const requestUrl = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(
    characterName
  )}&limit=10&order_by=favorites&sort=desc&page=${page}`;

  let data: CharacterSearchResponse | JikanErrorResponse;

  try {
    const result = await request(requestUrl);
    data = await result.body.json();
  } catch (error) {
    console.log("fetchCharacterByName", { error });

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

function getEmbedsFromCharacter(character: CharacterSearchResponse["data"][0]) {
  const fields: APIEmbedField[] = [
    {
      name: "Nicknames",
      value:
        character.nicknames.map((nickname) => `${nickname}`).join(", ") || "-",
      inline: true,
    },
    {
      // empty space
      name: "\u200b",
      value: "\u200b",
    },
  ];

  const embeds: (APIEmbed | JSONEncodable<APIEmbed>)[] = [
    {
      color: 0x57f287,
      author: {
        name: `Favorites: ${character.favorites}`,
      },
      title: `${character.name}`,
      image: {
        url: character.images.jpg.image_url,
      },
      fields,
      timestamp: new Date().toISOString(),
      url: character.url,
    },
  ];

  return embeds;
}

export async function fetchAndListCharacterPage({
  characterName,
  interaction,
  page,
}: {
  interaction:
    | ChatInputCommandInteraction<CacheType>
    | ButtonInteraction<CacheType>;
  characterName: string;
  page: number;
}) {
  await interaction.deferReply();

  const data: CharacterSearchResponse | JikanErrorResponse =
    await fetchCharacterByName({ characterName, page });

  if (isJikanError(data)) {
    return await interaction.editReply(
      "there was an error ``` " + data + " ```"
    );
  }

  const totalResultsCount = data.data.length;

  await interaction.editReply({
    content: `${totalResultsCount} results for ${"`" + characterName + "`"}`,
  });

  data.data.reverse().forEach(async (character, i) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Visit MAL")
        .setStyle(ButtonStyle.Link)
        .setURL(character.url)
    );

    await interaction.followUp({
      content: `**${totalResultsCount - i}** of **${totalResultsCount}**
***About*** (*${character.name}*)
${
  "```" +
  (character.about ? character.about.slice(0, 1900) : "no description found") +
  "```"
}
\u200b
`,
      embeds: getEmbedsFromCharacter(character),
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
          .setCustomId(`search-char ${characterName}`)
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
    .setName("search-character")
    .setDescription("Search for character from any anime, manga, manhwa etc")
    .addStringOption((option) =>
      option
        .setName("character-name")
        .setDescription("name of the character you are looking for")
        .setRequired(true)
    ),
  async execute(interaction) {
    const characterName = interaction.options.getString(
      "character-name"
    ) as string; // it is "required" option so will always be there

    await fetchAndListCharacterPage({ characterName, interaction, page: 1 });
  },
};
