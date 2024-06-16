import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../cmd-heroes-rank-data/config";
import { TypeChatConfig } from "../../types";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const channelIdToChatSessionMap: Record<string, ChatSession> = {};

export const initializeChatSessionCustomCharacter = (
  channelId: string,
  chatConfig: TypeChatConfig
) => {
  channelIdToChatSessionMap[channelId] = model.startChat(chatConfig);
};

export const getChatSessionCustomCharacter = (
  channelId: string,
  chatConfig: TypeChatConfig
) => {
  let chat: ChatSession;

  if (!channelIdToChatSessionMap[channelId]) {
    initializeChatSessionCustomCharacter(channelId, chatConfig);
  }
  chat = channelIdToChatSessionMap[channelId];

  return chat;
};
