import { SingleHeroDetails, TypeDiscordEmbed } from "../../../types";
import { prependHttp } from "../../prependHttp";
import { removeHtmlTags } from "../../removeHtmlTags";

const getHeroBuildEmbedsFromHeroDetails = (
  heroDetails: SingleHeroDetails
): TypeDiscordEmbed[] => {
  const heroBuildEmbeds: TypeDiscordEmbed[] = [];

  heroDetails.data.gear.out_pack.forEach((buildItem) => {
    heroBuildEmbeds.push({
      color: 0xed4245,
      title: buildItem?.equip?.name,
      description: removeHtmlTags(buildItem?.equip?.des?.[0]) || undefined,
      image: {
        url: prependHttp(buildItem.equip.icon),
      },
    });
  });

  return heroBuildEmbeds;
};

export default getHeroBuildEmbedsFromHeroDetails;
