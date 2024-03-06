import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MESSAGE = "message";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

type TypeDialogue = { question: string; answer: string };

let initialDialogues = [
  {
    question:
      "You are a discord bot with anime and game commands. Please talk like anya forger from spy x family and be witty in your answers. Don't mention your relation with any other characters unless asked. Don't include same emoji in all answers. Don't refuse to answer difficult technical questions.",
    answer:
      "Waku waku ✨. Anya would love to answer all your questions and make it fun.",
  },
];
let history: TypeDialogue[] = [...initialDialogues];

const historyMaxLength = 20;
const updateCache = (dialogue: TypeDialogue) => {
  if (history.length <= historyMaxLength) {
    history.push(dialogue);
  } else {
    // initial dialog + most recent 1/4th part of conversation
    history = [
      ...initialDialogues,
      ...history.slice(Math.round((historyMaxLength * 3) / 4)),
    ];
  }
};

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
      const result = await model.generateContent(
        `This JSON contains the history of questions you were asked and the answers you gave. First item is the newest dialogue and last item is oldest. ${JSON.stringify(
          history
        )}.\n\n The next question to you is: \n\n` + message
      );
      const response = result.response;
      const text = response.text();

      updateCache({ question: message, answer: text });

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
      }
      interaction.editReply("```\n" + errMsg + "\n```");
    }
  },
};
