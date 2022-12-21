import { SlashCommandBuilder } from "discord.js";
import { CustomClient, SlashCommand } from "src/types";

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("recommend-anime")
    .setDescription("Recommends random anime based on a genre")
    .addStringOption((option) =>
      option
        .setName("term")
        .setDescription("The term you want to look up")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const interactionClient = interaction.client as CustomClient;

    await interaction.editReply("hoho");
  },
};
