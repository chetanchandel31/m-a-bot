import { SlashCommandBuilder } from "discord.js";
import { CustomClient, SingleHeroDetails, SlashCommand } from "src/types";
import { request } from "undici";

const getProgressBar = (
  value: number,
  maxValue: number = 100,
  size: number = 10
) => {
  const percentage = value / maxValue; // Calculate the percentage of the bar
  const progress = Math.round(size * percentage); // Calculate the number of square caracters to fill the progress side.
  const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

  const progressText = "⚪".repeat(progress); // Repeat is creating a string with progress * caracters in it
  const emptyProgressText = "⚫".repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
  const percentageText = Math.round(percentage * 100) + "%"; // Displaying the percentage of the bar

  const bar =
    "```[" + progressText + emptyProgressText + "] " + percentageText + "```"; // Creating the bar
  return bar;
};

const getHeroStatsEmbed = (data: SingleHeroDetails) => ({
  color: 0x5865f2,
  title: `Stats (${data.data.name})`,
  image: {
    url: data.data.gallery_picture,
  },
  fields: [
    {
      name: "Durability",
      value: data.data.alive
        ? getProgressBar(Number(data.data.alive))
        : "nothing found",
    },
    {
      name: "Offense",
      value: data.data.phy
        ? getProgressBar(Number(data.data.phy))
        : "nothing found",
    },
    {
      name: "Control Effect",
      value: data.data.mag
        ? getProgressBar(Number(data.data.mag))
        : "nothing found",
    },
    {
      name: "Difficulty",
      value: data.data.diff
        ? getProgressBar(Number(data.data.diff))
        : "nothing found",
    },
  ],
  timestamp: new Date().toISOString(),
});

const getRelatedHeroEmbeds = (heroDetails: SingleHeroDetails) => {
  const relatedHeroEmbeds = [];

  const bestMate = heroDetails.data.counters.best;
  const counter = heroDetails.data.counters.counters;
  const counteredBy = heroDetails.data.counters.countered;

  const color = 0x57f287;

  if (bestMate.heroid) {
    relatedHeroEmbeds.push({
      color,
      title: "Best teammate",
      description: bestMate.name || "not found",
      fields: [
        {
          name: "Tips",
          value: bestMate.best_mate_tips || "nothing found",
        },
      ],
      image: {
        url: prependHttp(bestMate.icon),
      },
    });
  }

  if (counter.heroid) {
    relatedHeroEmbeds.push({
      color,
      title: "Strong against",
      description: counter.name || "not found",
      fields: [
        {
          name: "Tips",
          value: counter.restrain_hero_tips || "nothing found",
        },
      ],
      image: {
        url: prependHttp(counter.icon),
      },
    });
  }

  if (counteredBy.heroid) {
    relatedHeroEmbeds.push({
      color,
      title: "Countered by",
      description: counteredBy.name || "not found",
      fields: [
        {
          name: "Tips",
          value: counteredBy.by_restrain_tips || "nothing found",
        },
      ],
      image: {
        url: prependHttp(counteredBy.icon),
      },
    });
  }

  return relatedHeroEmbeds;
};

const removeTags = (str: string) => {
  if (str === "") return "nothing found";
  else {
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/gi, "");
  }
};

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
    color: 0xed4245,
    title: `${skill.name} ${i === skills.length - 1 ? " (Passive)" : ""}`,
    description: removeTags(skill.des),
    fields: [
      {
        name: "Tips",
        value: skill.tips || "nothing found",
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
      return interaction.editReply(`Couldn't find any hero with that name`);
    }

    const heroDetailsResult = await request(
      `https://mapi.mobilelegends.com/hero/detail?id=${relatedHero.heroid}`
    );
    const data: SingleHeroDetails = await heroDetailsResult.body.json();

    console.log(relatedHero.heroid, { data });

    const firstEmbed = {
      color: 0xefff00,
      title: data.data.name,
      description: data.data.type,
      image: {
        url: data.data.cover_picture,
      },
    };

    await interaction.editReply({
      embeds: [
        firstEmbed,
        ...getHeroSkillEmbeds(data),
        ...getRelatedHeroEmbeds(data),
        getHeroStatsEmbed(data),
      ],
    });
  },
};
