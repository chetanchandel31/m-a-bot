import { TypeRankData } from "../../zodSchemas/rankDataResponse";
// @ts-ignore
import AsciiTable from "ascii-table";
import { TypeRankDataMetric } from "./config";

type Params = {
  title: string;
  rankData: TypeRankData["data"]["data"];
  rankDataMetric: TypeRankDataMetric;
};

const getRankDataTable = ({ rankData, title, rankDataMetric }: Params) => {
  var table = new AsciiTable(title);
  table.setHeading("name", rankDataMetric);

  rankData.forEach((hero) => {
    let cellRankDataMetric = hero.use;
    if (rankDataMetric === "ban-rate") cellRankDataMetric = hero.ban;
    else if (rankDataMetric === "win-rate") cellRankDataMetric = hero.win;

    table.addRow(hero.name, cellRankDataMetric);
  });

  return "```" + table.toString() + "```";
};

export default getRankDataTable;
