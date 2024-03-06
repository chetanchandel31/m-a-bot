import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const AVATAR = "avatar";

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("set avatar(admin only)")
    .addAttachmentOption((option) =>
      option.setName(AVATAR).setDescription("avatar img").setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.user.id !== "277086778278543371") {
      return interaction.editReply(
        "You are not allowed to perform this action 🙅‍♂️"
      );
    }

    const avatar = interaction.options.getAttachment(AVATAR);

    async function sendMessage(message: string) {
      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription(message);

      await interaction.reply({ embeds: [embed] });
    }

    let error;
    await interaction.client.user
      .setAvatar(avatar?.url || "")
      .then(() => {
        interaction.reply("done 🤝");
      })
      .catch(async (err) => {
        error = true;
        console.log(err);
        return await sendMessage(`Error: \`${err.toString()}\``);
      });
  },
};
