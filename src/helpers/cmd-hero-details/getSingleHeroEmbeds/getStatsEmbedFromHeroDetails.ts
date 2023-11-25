import { SingleHeroDetails, TypeDiscordEmbed } from "../../../types";
import { getProgressBar } from "../../getProgressBar";

export const getStatsEmbedFromHeroDetails = (
  data: SingleHeroDetails
): TypeDiscordEmbed => ({
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
