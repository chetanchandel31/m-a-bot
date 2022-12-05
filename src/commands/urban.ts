import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/types";
import { request } from "undici";

const trim = (str: string, max: number) =>
  str.length > max ? `${str.slice(0, max - 3)}...` : str;

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("urban")
    .setDescription("Know urban dictionary meaning of any term"),
  async execute(interaction) {
    await interaction.deferReply();

    const term = interaction.options.getString("term");
    if (!term) {
      return interaction.editReply(`No term passed.`);
    }
    const query = new URLSearchParams({ term });

    const dictResult = await request(
      `https://api.urbandictionary.com/v0/define?${query}`
    );
    const { list } = await dictResult.body.json();

    if (!list.length) {
      return interaction.editReply(`No results found for **${term}**.`);
    }

    const [answer] = list;

    const embed = new EmbedBuilder()
      .setColor(0xefff00)
      .setTitle(answer.word)
      .setURL(answer.permalink)
      .addFields(
        { name: "Definition", value: trim(answer.definition, 1024) },
        { name: "Example", value: trim(answer.example, 1024) },
        {
          name: "Rating",
          value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down.`,
        }
      );
    interaction.editReply({ embeds: [embed] });
  },
};
