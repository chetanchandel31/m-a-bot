import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { request } from "undici";
import onClientReady from "./eventHandlers/clientReady";
import onInteractionCreate from "./eventHandlers/interactionCreate";
import { CustomClient, HeroListItem } from "./types";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

async function main(): Promise<void> {
  console.log("Bot is starting...", typeof process.env.TOKEN);

  const heroListResult = await request(
    `https://mapi.mobilelegends.com/hero/list`
  );
  const { data }: { data: HeroListItem[] } = await heroListResult.body.json();

  // create client instance
  const client: CustomClient = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.commands = new Collection();
  client.initialFetchedData = { heroesList: data };

  // put all commands from `/commands` dir in `client.commands`
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const { command } = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  // When the client is ready, run this code (only once)
  client.once(Events.ClientReady, onClientReady);

  client.on(Events.InteractionCreate, onInteractionCreate);

  // Log in to Discord with your client's token
  client.login(process.env.TOKEN);
}

main().catch((error) => {
  console.error(error, "🚨 top level await failed?");
});

const app = express();
app.listen(process.env.PORT || 7000, () => {
  console.log("LISTENING");
});
