import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import Fuse from "fuse.js";
import getEmbedsFromAnime from "../helpers/cmd-recommend-anime/getEmbedsFromAnime";
import { getAnime } from "../helpers/getAnime";
import { isJikanError } from "../helpers/isJikanError";
import {
  CustomClient,
  Genre,
  JikanErrorResponse,
  SlashCommand,
} from "../types";

const getRandomNum = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function getRelatedGenre(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  const genre = interaction.options.getString("genre") as string;
  const interactionClient = interaction.client as CustomClient;

  let relatedGenre: Genre | undefined =
    interactionClient.initialFetchedData?.genreList.find(
      (_genre) => String(_genre.mal_id) === genre
    );

  // try to find genre using both id and name
  if (!relatedGenre) {
    const fuse = new Fuse(
      interactionClient.initialFetchedData?.genreList ?? [],
      {
        keys: ["name"],
        threshold: 0.4,
      }
    );

    relatedGenre = fuse.search(genre).map(({ item }) => item)[0];
  }

  return relatedGenre;
}

export async function getTotalAnimeCount({
  relatedGenre,
  end_date,
  start_date,
}: {
  relatedGenre: Genre;
  start_date?: string;
  end_date?: string;
}) {
  let totalCount: number | JikanErrorResponse;

  if (!start_date && !end_date) {
    totalCount = relatedGenre.count;
  } else {
    const res = await getAnime({
      genres: String(relatedGenre.mal_id),
      start_date,
      end_date,
      limit: 1,
    });
    if (!isJikanError(res)) {
      totalCount = res.pagination.items.total;
    } else {
      totalCount = res;
    }
  }

  return totalCount;
}

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
        .setMaxLength(70)
    )
    .addIntegerOption((option) =>
      option
        .setName("start-year")
        .setDescription("anime aired before this year won't get recommended")
        .setMinValue(1950)
        .setMaxValue(new Date().getFullYear() + 1)
    )
    .addIntegerOption((option) =>
      option
        .setName("end-year")
        .setDescription("anime aired after this year won't get recommended")
        .setMinValue(1950)
        .setMaxValue(new Date().getFullYear() + 1)
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
          name: choice.name + ` (Total anime: ~${choice.count})`,
          value: String(choice.mal_id),
        }))
        .slice(0, 25)
    );
  },
  async execute(interaction) {
    await interaction.deferReply();
    const genre = getRelatedGenre(interaction);
    const startYear = interaction.options.getInteger("start-year") ?? undefined;
    const endYear = interaction.options.getInteger("end-year") ?? undefined;

    // validate options
    if (!genre) {
      return await interaction.editReply(
        `\`${interaction.options.getString("genre")}\`: no such genre found 🧐`
      );
    }
    if (startYear && endYear && startYear > endYear) {
      return await interaction.editReply(
        `*(${startYear} - ${endYear})*: ` +
          "invalid range, how can `start-year` be greater than `end-year` :person_shrugging:"
      );
    }
    if (startYear && endYear && startYear === endYear) {
      return await interaction.editReply(
        `*(${startYear} - ${endYear})*: ` +
          "invalid range, keep atleast 1 year gap between `start-year` and `end-year`"
      );
    }

    const start_date = startYear ? `${startYear}-01-01` : undefined;
    const end_date = endYear ? `${endYear}-01-01` : undefined;

    // handle total anime count
    const totalAnimeCount = await getTotalAnimeCount({
      relatedGenre: genre,
      start_date,
      end_date,
    });

    if (isJikanError(totalAnimeCount)) {
      return interaction.editReply(totalAnimeCount.error);
    }
    if (totalAnimeCount < 1) {
      return await interaction.editReply(
        `not enough anime for *\`${genre.name} (${startYear || "??"} - ${
          endYear || "??"
        })\`*
        
maybe try a different combination of \`genre\`, \`start-year\` and \`end-year\`?`
      );
    }

    // random page number
    const perPage = 10;
    const totalPageCount = Math.round(totalAnimeCount / perPage);
    const randomPage = getRandomNum(1, totalPageCount);

    const data = await getAnime({
      genres: String(genre.mal_id),
      limit: perPage,
      start_date,
      end_date,
      page: randomPage,
    });

    if (isJikanError(data)) {
      console.log({ data });
      return await interaction.editReply(
        "there was an error from Jikan while running " +
          `**${genre.name} (${startYear || "??"} - ${endYear || "??"})**`
      );
    }

    const approvedAnime = data.data.filter((anime) => anime.approved);

    if (approvedAnime.length < 1) {
      console.log({ totalAnimeCount, randomPage });
      return interaction.editReply(
        `try again, most anime i ran into were unapproved
        
        ${genre.name} (${startYear} - ${endYear})
        `
      );
    }

    // random number based on approved anime on current page
    const randomAnimeIndex = getRandomNum(0, approvedAnime.length - 1);
    const randomAnime = approvedAnime[randomAnimeIndex];

    // prepare and send embed
    const timeRange =
      startYear || endYear
        ? `**(${startYear || "??"} - ${endYear || "??"})** \n`
        : "";
    await interaction.followUp({
      content: `
Random **${genre.name}** anime out of total **\`${totalAnimeCount}\`** anime:
${timeRange}
***Synopsis*** (*${randomAnime.title}*)
${"```" + randomAnime.synopsis + "```"}
\u200b
`,
      embeds: getEmbedsFromAnime(randomAnime),
    });
  },
};
