import { SingleHeroDetails } from "../../../types";

export const getHeroBuildDescriptionFromHeroDetails = (
  heroDetails: SingleHeroDetails
) => {
  let heroBuildDescription: string | undefined;

  const tips = heroDetails.data?.gear.out_pack_tips;
  if (tips) {
    heroBuildDescription = "```\n" + tips + "\n```";
  }

  return heroBuildDescription;
};
