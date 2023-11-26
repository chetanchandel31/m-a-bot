import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const ENUM_HERO_INFO_OPTIONS = {
  GENERAL_INFO: "general-info",
  BUILD_INFO: "build-info",
  RANK_INFO: "rank-info",
} as const;

const getRowWithButtonsHeroInfoOptions = () => {
  const genralInfoBtn = new ButtonBuilder()
    .setCustomId(ENUM_HERO_INFO_OPTIONS.GENERAL_INFO)
    .setLabel("General info")
    .setStyle(ButtonStyle.Primary);

  const buildInfoBtn = new ButtonBuilder()
    .setCustomId(ENUM_HERO_INFO_OPTIONS.BUILD_INFO)
    .setLabel("Most popular build")
    .setStyle(ButtonStyle.Primary);

  const rankInfoBtn = new ButtonBuilder()
    .setCustomId(ENUM_HERO_INFO_OPTIONS.RANK_INFO)
    .setLabel("Rank info")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    genralInfoBtn,
    buildInfoBtn,
    rankInfoBtn
  );

  return row;
};

export default getRowWithButtonsHeroInfoOptions;
