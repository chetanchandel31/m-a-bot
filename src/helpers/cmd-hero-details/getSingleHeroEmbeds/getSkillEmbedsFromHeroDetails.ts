import { SingleHeroDetails, TypeDiscordEmbed } from "../../../types";
import { prependHttp } from "../../prependHttp";
import { removeHtmlTags } from "../../removeHtmlTags";

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
