type Params = {
  rankDataResultIndex: number;
};

const getRankEmbedContent = ({ rankDataResultIndex }: Params) => {
  let content = "**Rank**: ";

  if (rankDataResultIndex === 0) {
    content += "*All*";
  }
  if (rankDataResultIndex === 1) {
    content += "*Mythic*";
  }
  if (rankDataResultIndex === 2) {
    content += "*Mythic +*";
  }

  return content;
};

export default getRankEmbedContent;
