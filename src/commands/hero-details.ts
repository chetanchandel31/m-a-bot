import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "src/types";
import fetchHeroDetailsByHeroId from "./cmd-hero-details/fetchHeroDetailsByHeroId";
import { getHeroIdFromInitialFetchedDataByName } from "./cmd-hero-details/getHeroIdFromInitialFetchedDataByName";
import getHeroOverViewEmbed from "./cmd-hero-details/getSingleHeroEmbeds/getHeroOverViewEmbed";
import { getRelatedHeroesEmbedsFromHeroDetails } from "./cmd-hero-details/getSingleHeroEmbeds/getRelatedHeroesEmbedsFromHeroDetails";
import { getSkillEmbedsFromHeroDetails } from "./cmd-hero-details/getSingleHeroEmbeds/getSkillEmbedsFromHeroDetails";
import { getStatsEmbedFromHeroDetails } from "./cmd-hero-details/getSingleHeroEmbeds/getStatsEmbedFromHeroDetails";

const fetchHeroDetailsAndSendEmbeds = async ({
  interaction,
  relatedHeroId,
}: {
  relatedHeroId: string;
  interaction: ChatInputCommandInteraction<CacheType>;
}) => {
  const heroDetailsResult = await fetchHeroDetailsByHeroId(relatedHeroId);

  if (heroDetailsResult.isSuccess) {
    const heroDetails = heroDetailsResult.result;

    console.log(relatedHeroId, { heroDetails });

    await interaction.editReply({
      embeds: [
        getHeroOverViewEmbed(heroDetails),
        ...getSkillEmbedsFromHeroDetails(heroDetails),
        ...getRelatedHeroesEmbedsFromHeroDetails(heroDetails),
        getStatsEmbedFromHeroDetails(heroDetails),
      ],
    });
  } else {
    interaction.editReply(heroDetailsResult.errorMessage);
  }
};

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("hero-details")
    .setDescription("Get a ml hero's details")
    .addStringOption((option) =>
      option
        .setName("hero-name")
        .setDescription("name of the hero you want details of")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const heroName = interaction.options.getString("hero-name") as string; // it is "required" option so will always be there

    const relatedHeroId = getHeroIdFromInitialFetchedDataByName({
      heroName,
      interaction,
    });

    if (!relatedHeroId) {
      interaction.editReply(`Couldn't find any hero with that name`);
    } else {
      fetchHeroDetailsAndSendEmbeds({
        interaction,
        relatedHeroId,
      });
    }
  },
};
