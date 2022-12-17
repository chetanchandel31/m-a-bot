import {
  APIEmbed,
  APIEmbedField,
  JSONEncodable,
  SlashCommandBuilder,
} from "discord.js";
import { JikanErrorResponse, SlashCommand } from "src/types";
import { request } from "undici";

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

const isJikanError = (data: unknown): data is JikanErrorResponse =>
  !!data && typeof data === "object" && "error" in data;

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("search-character")
    .setDescription(
      "Character name from any anime, manga, manhwa, lightnovel etc"
    )
    .addStringOption((option) =>
      option
        .setName("character-name")
        .setDescription("name of the character you are looking for")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const characterName = interaction.options.getString(
      "character-name"
    ) as string; // it is "required" option so will always be there

    const result = await request(
      `https://api.jikan.moe/v4/characters?letter=${encodeURIComponent(
        characterName
      )}&limit=10&order_by=favorites&sort=desc`
    );
    const data: CharacterSearchResponse | JikanErrorResponse =
      await result.body.json();

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
      const fields: APIEmbedField[] | undefined = [
        {
          name: "Nicknames",
          value:
            character.nicknames.map((nickname) => `${nickname}`).join(", ") ||
            "-",
          inline: true,
        },
        {
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

      await interaction.followUp({
        content: `**${totalResultsCount - i}** of **${totalResultsCount}**
***About*** (*${character.name}*)
  ${
    "```" +
    (character.about
      ? character.about.slice(0, 1900)
      : "no description found") +
    "```"
  }
  \u200b
  `,
        embeds,
      });
    });
  },
};
