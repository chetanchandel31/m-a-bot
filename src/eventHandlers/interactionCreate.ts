import {
  AutocompleteInteraction,
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";
import { fetchAndListAnimePage } from "../commands/searchAnime";
import { fetchAndListCharacterPage } from "../commands/searchCharacter";
import { fetchAndListMangaPage } from "../commands/searchManga";
import { CustomClient } from "../types";

const handleChatInputCommandInteraction = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const interactionClient = interaction.client as CustomClient;

  const command =
    interactionClient.commands &&
    interactionClient.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
  } else {
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
};

const handleAutocompleteInteraction = async (
  interaction: AutocompleteInteraction<CacheType>
) => {
  const interactionClient = interaction.client as CustomClient;

  const command =
    interactionClient.commands &&
    interactionClient.commands.get(interaction.commandName);

  if (!command || !command.autocomplete) {
    console.error(`No command matching ${interaction.commandName} was found.`);
  } else {
    try {
      command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }
};

const handleButtonInteraction = async (
  interaction: ButtonInteraction<CacheType>
) => {
  if (interaction.customId.startsWith("search-anime")) {
    const animeName = interaction.customId.slice(13);
    const page = Number(interaction.message.content.slice(6).split("/")[0]) + 1;

    // if one of `interaction.update` or `inteaction.reply` is used, interaction is considered complete and the other cannot be used

    await fetchAndListAnimePage({ animeName, interaction, page });
  } else if (interaction.customId.startsWith("search-manga")) {
    const mangaName = interaction.customId.slice(13);
    const page = Number(interaction.message.content.slice(6).split("/")[0]) + 1;

    await fetchAndListMangaPage({ mangaName, interaction, page });
  } else if (interaction.customId.startsWith("search-char")) {
    const characterName = interaction.customId.slice(12);
    const page = Number(interaction.message.content.slice(6).split("/")[0]) + 1;

    await fetchAndListCharacterPage({ characterName, interaction, page });
  }
};

export default async function onInteractionCreate(
  interaction: Interaction<CacheType>
) {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommandInteraction(interaction);
  } else if (interaction.isAutocomplete()) {
    await handleAutocompleteInteraction(interaction);
  } else if (interaction.isButton()) {
    handleButtonInteraction(interaction);
  }
}
