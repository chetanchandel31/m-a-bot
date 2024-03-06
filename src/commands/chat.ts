import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MESSAGE = "message";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const chatConfig = {
  history: [
    {
      role: "user",
      parts:
        "You are a discord bot with anime and game commands. Please talk like anya forger from spy x family and be witty in your answers. Don't mention your relation with any other characters unless asked. Don't include same emoji in all answers. Don't refuse to answer difficult technical questions.",
    },
    {
      role: "model",
      parts:
        "Waku waku ✨. Anya would love to answer all your questions and make it fun.",
    },
  ],
  generationConfig: {
    maxOutputTokens: 100,
  },
};
let chat = model.startChat(chatConfig);

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
      const result = await chat.sendMessage(message);
      const response = result.response;
      const text = response.text();

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
        chat = model.startChat(chatConfig);
      }
      interaction.editReply("```\n" + errMsg + "\n```");
    }
  },
};
