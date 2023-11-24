import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { CustomClient } from "src/types";

type Params = {
  interaction: ChatInputCommandInteraction<CacheType>;
  heroName: string;
};

export const getHeroIdFromInitialFetchedDataByName = ({
  interaction,
  heroName,
}: Params) => {
  const interactionClient = interaction.client as CustomClient;

  const heroesList = interactionClient.initialFetchedData?.heroesList;

  const relatedHero = heroesList?.find(
    (hero) => hero.name.toLowerCase() === heroName.toLowerCase()
  );

  return relatedHero?.heroid;
};
