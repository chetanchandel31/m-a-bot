import { SlashCommandBuilder } from "discord.js";
import { fetchRankData } from "../helpers/cmd-hero-details/fetchRankData";
import {
  ENUM_HEROES_RANK_DATA_COMMAND_OPTIONS,
  ENUM_RANK_OPTIONS,
  ENUM_RANK_DATA_METRICS,
  TypeRankDataMetric,
  TypeRankOption,
} from "../helpers/cmd-heroes-rank-data/config";
import getRankDataTable from "../helpers/cmd-heroes-rank-data/getRankDataTable";
import { divideArray } from "../helpers/divideArray";
import { SlashCommand } from "../types";
import getSortedRankData from "../helpers/cmd-heroes-rank-data/getSortedRankData";

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("heroes-rank-data")
    .setDescription("Get rank data for mobile legends heroes")
    .addStringOption((option) =>
      option
        .setName(ENUM_HEROES_RANK_DATA_COMMAND_OPTIONS.METRIC)
        .setDescription("Rank data for which metric do you need?")
        .addChoices(
          { name: "Usage", value: ENUM_RANK_DATA_METRICS.USAGE },
          { name: "Win-rate", value: ENUM_RANK_DATA_METRICS.WIN_RATE },
          { name: "Ban-rate", value: ENUM_RANK_DATA_METRICS.BAN_RATE }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName(ENUM_HEROES_RANK_DATA_COMMAND_OPTIONS.RANK)
        .setDescription("Which rank's data do you need?")
        .addChoices(
          { name: "All", value: ENUM_RANK_OPTIONS.ALL },
          { name: "Mythic", value: ENUM_RANK_OPTIONS.MYTHIC },
          { name: "Mythic +", value: ENUM_RANK_OPTIONS.MYTHIC_PLUS }
        )
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.deferReply();

    const rankOption = (interaction.options.getString(
      ENUM_HEROES_RANK_DATA_COMMAND_OPTIONS.RANK
    ) || ENUM_RANK_OPTIONS.ALL) as TypeRankOption;
    const rankDataMetric = (interaction.options.getString(
      ENUM_HEROES_RANK_DATA_COMMAND_OPTIONS.METRIC
    ) || ENUM_RANK_DATA_METRICS.USAGE) as TypeRankDataMetric;

    const rankDataResult = await fetchRankData({ rank: rankOption });

    if (rankDataResult.isSuccess === false) {
      interaction.editReply(rankDataResult.errorMessage);
    } else {
      const sortedRankData = getSortedRankData({
        rankData: rankDataResult.result,
        rankDataMetric,
      });
      const rankDataChunks = divideArray(sortedRankData.data.data, 40);

      await interaction.editReply(
        `***${rankDataMetric}*** stats for heroes in rank: ***${rankOption}***`
      );

      for (
        let chunkIndex = 0;
        chunkIndex < rankDataChunks.length;
        chunkIndex++
      ) {
        const rankDataChunk = rankDataChunks[chunkIndex];
        const rankDataTable = getRankDataTable({
          rankData: rankDataChunk,
          title: `Page: ${chunkIndex + 1}/${rankDataChunks.length}`,
          rankDataMetric: rankDataMetric,
        });

        await interaction.followUp(rankDataTable);
      }
    }
  },
};
