import { SlashCommandBuilder } from "discord.js";
import { CustomClient, Genre, SlashCommand } from "../types";
// @ts-ignore
import AsciiTable from "ascii-table";

function getTable(genreList: Genre[], title: string) {
  var table = new AsciiTable(title);
  table.setHeading("name", "mal-id", "count");

  genreList.forEach((genre) => {
    table.addRow(genre.name, genre.mal_id, genre.count);
  });

  return "```" + table.toString() + "```";
}

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("genre-list")
    .setDescription("view list of genre available with MAL"),
  async execute(interaction) {
    const interactionClient = interaction.client as CustomClient;

    const genreList = interactionClient.initialFetchedData?.genreList || [];

    await interaction.reply(`
${getTable(genreList.slice(0, 40), "Page: 1/2")}`);

    await interaction.followUp(`
${getTable(genreList.slice(40), "Page: 2/2")}`);
  },
};
