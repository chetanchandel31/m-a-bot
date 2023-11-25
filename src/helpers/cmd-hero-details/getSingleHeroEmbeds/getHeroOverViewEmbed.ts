import { SingleHeroDetails, TypeDiscordEmbed } from "../../../types";

const getHeroOverViewEmbed = (
  heroDetails: SingleHeroDetails
): TypeDiscordEmbed => {
  return {
    color: 0xefff00,
    title: heroDetails.data.name,
    description: heroDetails.data.type,
    image: {
      url: heroDetails.data.cover_picture,
    },
  };
};

export default getHeroOverViewEmbed;
