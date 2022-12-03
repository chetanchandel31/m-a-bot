import { Client, Events, GatewayIntentBits } from "discord.js";
import { token } from "./config.json";

console.log("Bot is starting...");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag} 😀`);
});

// Log in to Discord with your client's token
client.login(token);
