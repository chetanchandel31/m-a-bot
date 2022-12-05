import { REST, Routes } from "discord.js";
import { clientId, guildId, token } from "./config.json";
import fs from "node:fs";
import path from "node:path";

const assertDataLength = (data: unknown): data is { length: number } =>
  !!data && typeof data === "object" && "length" in data;

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const { command } = require(filePath);
  commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      process.argv.slice(2)[0] === "global"
        ? Routes.applicationCommands(clientId)
        : Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    if (assertDataLength(data)) {
      console.log(
        `Successfully reloaded ${data?.length} application (/) commands.`
      );
    }
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
