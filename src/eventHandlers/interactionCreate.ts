import { CacheType, Interaction } from "discord.js";
import { CustomClient } from "src/types";

export default async function onInteractionCreate(
  interaction: Interaction<CacheType>
) {
  if (!interaction.isChatInputCommand()) return;

  const interactionClient = interaction.client as CustomClient;

  const command =
    interactionClient.commands &&
    interactionClient.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

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
