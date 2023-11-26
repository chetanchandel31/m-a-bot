import { TypeRankData } from "../../zodSchemas/rankDataResponse";
import getDeepCopy from "../getDeepCopy";
import { TypeRankDataMetric } from "./config";

const getRankDataMetricNumber = ({
  rankDataMetric,
  rankDataHero,
}: {
  rankDataHero: TypeRankData["data"]["data"][number];
  rankDataMetric: TypeRankDataMetric;
}) => {
  let _rankDataMetric = rankDataHero.use;
  if (rankDataMetric === "ban-rate") _rankDataMetric = rankDataHero.ban;
  else if (rankDataMetric === "win-rate") _rankDataMetric = rankDataHero.win;

  return Number(_rankDataMetric.replaceAll("%", ""));
};

type Params = {
  rankData: TypeRankData;
  rankDataMetric: TypeRankDataMetric;
};

const getSortedRankData = ({ rankData, rankDataMetric }: Params) => {
  const sortedRankData = getDeepCopy(rankData);

  sortedRankData.data.data.sort((prevHero, hero) => {
    const rankDataMetricNumberPrevHero = getRankDataMetricNumber({
      rankDataHero: prevHero,
      rankDataMetric,
    });

    const rankDataMetricNumberHero = getRankDataMetricNumber({
      rankDataHero: hero,
      rankDataMetric,
    });

    return rankDataMetricNumberHero - rankDataMetricNumberPrevHero;
  });

  return sortedRankData;
};

export default getSortedRankData;
