import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import {
  getChatSession,
  initializeChatSession,
} from "../helpers/cmd-chat/chatSession";

const MESSAGE = "message";

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Talk to the bot")
    .addStringOption((option) =>
      option
        .setName(MESSAGE)
        .setDescription("Your message to the bot")
        .setRequired(true)
        .setMaxLength(3500)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const message = interaction.options.getString(MESSAGE) as string; // it is "required" option so will always be there

    try {
      const chatSession = getChatSession(interaction.channelId);

      const result = await chatSession.sendMessage(message);
      const response = result.response;
      const text = response.text();

      if (!text) {
        // something went wrong, sending another message to same session will throw error, better reset session before that
        initializeChatSession(interaction.channelId);
      }

      interaction.editReply({
        content: `
> <@${interaction.user.id}>: ${message}

${text}    
`,
      });
    } catch (e) {
      console.log(e);
      let errMsg = "something went wrong with gemini api";
      if (e instanceof Error && e.message) {
        errMsg = e.message;
        initializeChatSession(interaction.channelId);
      }
      interaction.editReply("```\n" + errMsg + "\n```");
    }
  },
};
