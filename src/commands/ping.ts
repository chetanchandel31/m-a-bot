import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/types";

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
