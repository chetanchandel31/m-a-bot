import { prependHttp } from "src/helpers/prependHttp";
import { SingleHeroDetails, TypeDiscordEmbed } from "src/types";

export const getRelatedHeroesEmbedsFromHeroDetails = (
  heroDetails: SingleHeroDetails
): TypeDiscordEmbed[] => {
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
