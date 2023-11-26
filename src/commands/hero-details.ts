import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import fetchHeroDetailsByHeroId from "../helpers/cmd-hero-details/fetchHeroDetailsByHeroId";
import { fetchRankData } from "../helpers/cmd-hero-details/fetchRankData";
import { getHeroIdFromInitialFetchedDataByName } from "../helpers/cmd-hero-details/getHeroIdFromInitialFetchedDataByName";
import getRowWithButtonsHeroInfoOptions, {
  ENUM_HERO_INFO_OPTIONS,
} from "../helpers/cmd-hero-details/getRowWithButtonsHeroInfoOptions";
import { getHeroBuildDescriptionFromHeroDetails } from "../helpers/cmd-hero-details/getSingleHeroEmbeds/getHeroBuildDescriptionFromHeroDetails";
import getHeroBuildEmbedsFromHeroDetails from "../helpers/cmd-hero-details/getSingleHeroEmbeds/getHeroBuildEmbedsFromHeroDetails";
import getHeroOverViewEmbed from "../helpers/cmd-hero-details/getSingleHeroEmbeds/getHeroOverViewEmbed";
import { getRelatedHeroesEmbedsFromHeroDetails } from "../helpers/cmd-hero-details/getSingleHeroEmbeds/getRelatedHeroesEmbedsFromHeroDetails";
import { getSkillEmbedsFromHeroDetails } from "../helpers/cmd-hero-details/getSingleHeroEmbeds/getSkillEmbedsFromHeroDetails";
import { getStatsEmbedFromHeroDetails } from "../helpers/cmd-hero-details/getSingleHeroEmbeds/getStatsEmbedFromHeroDetails";
import { CustomClient, SlashCommand, TypeResult } from "../types";
import findRelatedHeroAndGetRankDataEmbed from "../helpers/cmd-hero-details/getSingleHeroEmbeds/findRelatedHeroAndGetRankDataEmbed";
import { TypeRankData } from "../zodSchemas/rankDataResponse";
import getRankEmbedContent from "../helpers/cmd-hero-details/getRankEmbedContent";
import getAutocompleteOptionsHeroName from "../helpers/cmd-hero-details/getAutocompleteOptionsHeroName";

const commandOptionsNames = { HERO_NAME: "hero-name" } as const;

const handleAutocomplete = async (
  interaction: AutocompleteInteraction<CacheType>
) => {
  const focusedValue = interaction.options.getFocused();
  const interactionClient = interaction.client as CustomClient;

  const autoCompleteOptionsHeroName = getAutocompleteOptionsHeroName({
    initialFetchedData: interactionClient.initialFetchedData,
    searchQuery: focusedValue,
  });

  await interaction.respond(autoCompleteOptionsHeroName);
};

const fetchHeroAndSendGeneralInfoEmbeds = async ({
  interaction,
  relatedHeroId,
}: {
  relatedHeroId: string;
  interaction: ChatInputCommandInteraction<CacheType>;
}) => {
  const heroDetailsResult = await fetchHeroDetailsByHeroId(relatedHeroId);

  if (heroDetailsResult.isSuccess) {
    const heroDetails = heroDetailsResult.result;

    await interaction.followUp({
      embeds: [
        getHeroOverViewEmbed(heroDetails),
        ...getSkillEmbedsFromHeroDetails(heroDetails),
        ...getRelatedHeroesEmbedsFromHeroDetails(heroDetails),
        getStatsEmbedFromHeroDetails(heroDetails),
      ],
    });
  } else {
    interaction.followUp(heroDetailsResult.errorMessage);
  }
};

const fetchHeroAndSendBuildInfoEmbeds = async ({
  interaction,
  relatedHeroId,
}: {
  relatedHeroId: string;
  interaction: ChatInputCommandInteraction<CacheType>;
}) => {
  const heroDetailsResult = await fetchHeroDetailsByHeroId(relatedHeroId);
  let interactionFollowUpPayload: Parameters<typeof interaction.followUp>[0];
  const heroName = interaction.options.getString(
    commandOptionsNames.HERO_NAME
  ) as string; // it is "required" option so will always be there

  if (heroDetailsResult.isSuccess === false) {
    interactionFollowUpPayload = heroDetailsResult.errorMessage;
  } else if (
    !heroDetailsResult?.result?.data?.gear?.out_pack?.[0]?.equip?.name
  ) {
    interactionFollowUpPayload = `No build found for ${heroName}`;
  } else {
    interactionFollowUpPayload = {
      content: getHeroBuildDescriptionFromHeroDetails(heroDetailsResult.result),
      embeds: [...getHeroBuildEmbedsFromHeroDetails(heroDetailsResult.result)],
    };
  }

  interaction.followUp(interactionFollowUpPayload);
};

const sendSingleRankInfoEmbed = async ({
  interaction,
  rankDataResult,
  relatedHeroId,
  rankDataResultIndex,
}: {
  interaction: ChatInputCommandInteraction<CacheType>;
  rankDataResult: TypeResult<TypeRankData>;
  rankDataResultIndex: number;
  relatedHeroId: string;
}) => {
  let interactionFollowUpPayload: Parameters<typeof interaction.followUp>[0];

  if (rankDataResult.isSuccess === false) {
    interactionFollowUpPayload = rankDataResult.errorMessage;
  } else {
    const heroRankDataEmbed = findRelatedHeroAndGetRankDataEmbed({
      rankData: rankDataResult.result,
      relatedHeroId,
    });

    if (heroRankDataEmbed.isSuccess) {
      interactionFollowUpPayload = {
        content: getRankEmbedContent({ rankDataResultIndex }),
        embeds: [heroRankDataEmbed.result],
      };
    } else {
      interactionFollowUpPayload = heroRankDataEmbed.errorMessage;
    }
  }

  interaction.followUp(interactionFollowUpPayload);
};

const fetchRankInfoAndSendEmbeds = async ({
  interaction,
  relatedHeroId,
}: {
  interaction: ChatInputCommandInteraction<CacheType>;
  relatedHeroId: string;
}) => {
  const rankDataResults = await Promise.all([
    fetchRankData({ rank: "all" }),
    fetchRankData({ rank: "mythic" }),
    fetchRankData({ rank: "mythic+" }),
  ]);

  for (let i = 0; i < rankDataResults.length; i++) {
    const rankDataResult = rankDataResults[i];

    await sendSingleRankInfoEmbed({
      interaction,
      rankDataResult,
      relatedHeroId,
      rankDataResultIndex: i,
    });
  }
};

const sendHeroInfoButtons = async ({
  interaction,
  relatedHeroId,
}: {
  relatedHeroId: string;
  interaction: ChatInputCommandInteraction<CacheType>;
}) => {
  const row = getRowWithButtonsHeroInfoOptions();

  const userResponseHeroInfoButtons = await interaction.editReply({
    content: `Please select an option`,
    components: [row],
  });

  try {
    const confirmation =
      await userResponseHeroInfoButtons.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 60000,
      });

    // remove hero info buttons on initial question
    confirmation.update({ components: [] });

    if (confirmation.customId === ENUM_HERO_INFO_OPTIONS.GENERAL_INFO) {
      fetchHeroAndSendGeneralInfoEmbeds({
        interaction,
        relatedHeroId,
      });
    } else if (confirmation.customId === ENUM_HERO_INFO_OPTIONS.BUILD_INFO) {
      fetchHeroAndSendBuildInfoEmbeds({
        interaction,
        relatedHeroId,
      });
    } else if (confirmation.customId === ENUM_HERO_INFO_OPTIONS.RANK_INFO) {
      fetchRankInfoAndSendEmbeds({ interaction, relatedHeroId });
    } else {
      interaction.editReply(`Something went wrong #yiu829798`);
    }
  } catch (e) {
    await interaction.editReply({
      content: "Response not received within 1 minute, cancelling",
      components: [],
    });
  }
};

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("hero-details")
    .setDescription("Get a ml hero's details")
    .addStringOption((option) =>
      option
        .setName(commandOptionsNames.HERO_NAME)
        .setDescription("name of the hero you want details of")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  autocomplete: handleAutocomplete,

  async execute(interaction) {
    await interaction.deferReply();

    const heroName = interaction.options.getString(
      commandOptionsNames.HERO_NAME
    ) as string; // it is "required" option so will always be there

    const relatedHeroId = getHeroIdFromInitialFetchedDataByName({
      heroName,
      interaction,
    });

    if (!relatedHeroId) {
      interaction.editReply(
        `Couldn't find any hero with name ${heroName}, consider picking something from auto-complete options`
      );
    } else {
      sendHeroInfoButtons({
        interaction,
        relatedHeroId,
      });
    }
  },
};
