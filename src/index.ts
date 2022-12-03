import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { token } from "./config.json";
import fs from "node:fs";
import path from "node:path";
import { CustomClient } from "./types";

console.log("Bot is starting...");

// create client instance
const client: CustomClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// put all commands from `/commands` dir in `client.commands`
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));

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
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag} 😀`);
});

// Log in to Discord with your client's token
client.login(token);
