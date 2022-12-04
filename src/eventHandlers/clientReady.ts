import { Client } from "discord.js";

export default function onClientReady(client: Client<true>) {
  console.log(`Ready! Logged in as ${client.user.tag}`);
}
