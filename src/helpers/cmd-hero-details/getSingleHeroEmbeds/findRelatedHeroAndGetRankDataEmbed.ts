import { TypeDiscordEmbed, TypeResult } from "../../../types";
import { TypeRankData } from "../../../zodSchemas/rankDataResponse";
import { prependHttp } from "../../prependHttp";

type Params = {
  relatedHeroId: string;
  rankData: TypeRankData;
};

const getHeroRankDataEmbed = (
  hero: TypeRankData["data"]["data"][number]
): TypeDiscordEmbed => {
  return {
    color: 0xefff00,
    title: hero.name,
    fields: [
      {
        name: "Ban",
        value: hero.ban || "nothing found",
      },
      {
        name: "Use",
        value: hero.use || "nothing found",
      },
      {
        name: "Win",
        value: hero.win || "nothing found",
      },
    ],
    image: {
      url: prependHttp(hero.avatar),
    },
  };
};

const findRelatedHeroAndGetRankDataEmbed = ({
  relatedHeroId,
  rankData,
}: Params): TypeResult<TypeDiscordEmbed> => {
  let result: TypeResult<TypeDiscordEmbed>;

  const relatedHero = rankData.data.data.find(
    (hero) => Number(hero.id) === Number(relatedHeroId)
  );

  if (!relatedHero) {
    result = {
      isSuccess: false,
      errorMessage: "Couldn't find this hero in rank data",
    };
  } else {
    result = {
      isSuccess: true,
      result: getHeroRankDataEmbed(relatedHero),
    };
  }

  return result;
};

export default findRelatedHeroAndGetRankDataEmbed;
