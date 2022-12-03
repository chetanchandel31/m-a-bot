import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies pong!"),
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Pong!");
  },
};
