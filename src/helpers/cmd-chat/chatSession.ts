import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../cmd-heroes-rank-data/config";

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

const channelIdToChatSessionMap: Record<string, ChatSession> = {};

export const initializeChatSession = (channelId: string) => {
  channelIdToChatSessionMap[channelId] = model.startChat(chatConfig);
};

export const getChatSession = (channelId: string) => {
  let chat: ChatSession;

  if (!channelIdToChatSessionMap[channelId]) {
    initializeChatSession(channelId);
  }
  chat = channelIdToChatSessionMap[channelId];

  return chat;
};
