import { prependHttp } from "src/helpers/prependHttp";
import { removeHtmlTags } from "src/helpers/removeHtmlTags";
import { SingleHeroDetails, TypeDiscordEmbed } from "src/types";

export const getSkillEmbedsFromHeroDetails = (
  heroDetails: SingleHeroDetails
): TypeDiscordEmbed[] => {
  const skills = heroDetails.data.skill.skill;

  return skills.map((skill, i) => ({
    color: 0xed4245,
    title: `${skill.name} ${i === skills.length - 1 ? " (Passive)" : ""}`,
    description: removeHtmlTags(skill.des),
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
