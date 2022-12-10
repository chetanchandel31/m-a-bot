import { SlashCommandBuilder } from "discord.js";
import { CustomClient, SingleHeroDetails, SlashCommand } from "src/types";
import { request } from "undici";

const prependHttp = (str: string) => {
  if (!str.startsWith("http")) {
    return `http:${str}`;
  } else {
    return str;
  }
};

const getHeroSkillEmbeds = (heroDetails: SingleHeroDetails) => {
  const skills = heroDetails.data.skill.skill;

  return skills.map((skill, i) => ({
    color: 0xefff00,
    title: `${skill.name} ${i === skills.length - 1 ? " (Passive)" : ""}`,
    description: skill.des,
    fields: [
      {
        name: "Tips",
        value: skill.tips,
      },
    ],
    image: {
      url: prependHttp(skill.icon),
    },
  }));
};

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("hero-details")
    .setDescription("get a ml hero's details")
    .addStringOption((option) =>
      option
        .setName("hero-name")
        .setDescription("name of the hero you want details of")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const interactionClient = interaction.client as CustomClient;

    const heroesList = interactionClient.initialFetchedData?.heroesList;

    const heroName = interaction.options.getString("hero-name") as string; // it is "required" option so will always be there
    const relatedHero = heroesList?.find(
      (hero) => hero.name.toLowerCase() === heroName.toLowerCase()
    );

    if (!relatedHero) {
      return interaction.editReply(`Couldn't find hero with that name`);
    }

    const heroDetailsResult = await request(
      `https://mapi.mobilelegends.com/hero/detail?id=${relatedHero.heroid}`
    );
    const data: SingleHeroDetails = await heroDetailsResult.body.json();

    console.log(relatedHero.heroid, { data });

    const firstEmbed = {
      color: 0x0099ff,
      title: data.data.name,
      description: data.data.type,
      thumbnail: {
        url: data.data.gallery_picture,
      },
      image: {
        url: data.data.cover_picture,
      },
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({
      embeds: [
        firstEmbed,
        ...getHeroSkillEmbeds(data),
        {
          color: 0xefff00,
          image: {
            url: data.data.gallery_picture,
          },
        },
      ],
    });
  },
};