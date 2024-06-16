import { SlashCommandBuilder } from "discord.js";
import {
  getChatSessionCustomCharacter,
  initializeChatSessionCustomCharacter,
} from "../helpers/cmd-chat-custom-character/chatSessionCustomCharacter";
import getChatConfigFromQuestions from "../helpers/cmd-chat-custom-character/getChatConfigFromQuestions";
import getPrismaClient from "../helpers/getPrismaClient";
import { SlashCommand } from "../types";
import { DASHBOARD_URL } from "../config";

const MESSAGE = "message";

const prisma = getPrismaClient();

type TypeChatConfigQuestions = {
  question: string;
  answer: string;
}[];

let chatConfigQuestions: TypeChatConfigQuestions | null = null;
let chatConfigUpdatedAtMs: number | null = null;

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("chat-custom-character")
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
      /* - read and store questions from db, re-initialize chat if needed */
      const chatConfig = getChatConfigFromQuestions(chatConfigQuestions || []);
      const chatConfigFromDb = await prisma.chatConfig.findFirst({
        where: {
          serverId: interaction.guildId || "",
        },
      });
      if (chatConfigFromDb?.updatedAt.getTime() !== chatConfigUpdatedAtMs) {
        initializeChatSessionCustomCharacter(
          interaction.channelId,
          getChatConfigFromQuestions(chatConfigFromDb?.questions || [])
        );
      }
      if (chatConfigFromDb) {
        chatConfigQuestions = chatConfigFromDb.questions;
        chatConfigUpdatedAtMs = chatConfigFromDb.updatedAt.getTime();
      }

      // manage chat session
      const chatSession = getChatSessionCustomCharacter(
        interaction.channelId,
        chatConfig
      );
      const result = await chatSession.sendMessage(message);
      const response = result.response;
      const text = response.text();

      if (!text) {
        // something went wrong, sending another message to same session will throw error, better reset session before that
        initializeChatSessionCustomCharacter(interaction.channelId, chatConfig);
      }

      interaction.editReply({
        content: `
> <@${interaction.user.id}>: ${message}

${text}

*💡 You can add custom conversations [here](${DASHBOARD_URL}${
          interaction.guildId
        }?server=${encodeURIComponent(
          interaction.guild?.name || ""
        )}) to customize the bot's personality*
`,
      });
    } catch (e) {
      console.log(e);
      let errMsg = "something went wrong with gemini api";
      if (e instanceof Error && e.message) {
        errMsg = e.message;
        initializeChatSessionCustomCharacter(
          interaction.channelId,
          getChatConfigFromQuestions(chatConfigQuestions || [])
        );
      }
      interaction.editReply("```\n" + errMsg + "\n```");
    }
  },
};
