import { APIEmbed, APIEmbedField, JSONEncodable } from "discord.js";
import { getFormattedScore } from "../getFormattedScore";
import { AnimeSearchResponse } from "../../types";

const getEmbedsFromAnime = (randomAnime: AnimeSearchResponse["data"][0]) => {
  const fields: APIEmbedField[] = [
    {
      name: "Season",
      value: randomAnime.season ?? "-",
      inline: true,
    },
    {
      name: "Titles",
      value:
        randomAnime.titles.map((title) => `${title.title}`).join(", ") || "-",
      inline: true,
    },
    {
      // empty space
      name: "\u200b",
      value: "\u200b",
    },
    {
      name: "Episodes",
      value: String(randomAnime.episodes ?? "-"),
      inline: true,
    },
    {
      name: "Duration",
      value: randomAnime.duration ?? "-",
      inline: true,
    },
    {
      name: "Aired",
      value:
        randomAnime.aired?.string + (randomAnime.airing ? " (on-going)" : ""),
      inline: true,
    },
    {
      name: "Type",
      value: randomAnime.type ?? "-",
      inline: true,
    },
    {
      name: "Source",
      value: randomAnime.source ?? "-",
      inline: true,
    },
    {
      name: "Studio",
      value:
        randomAnime.studios
          .map((studio) => `${studio.name} (${studio.type})`)
          .join(", ") || "-",
      inline: true,
    },
    {
      // empty space
      name: "\u200b",
      value: "\u200b",
    },
    {
      name: "Genre",
      value:
        randomAnime.genres
          .concat(randomAnime.explicit_genres)
          .map((genre) => `${genre.name}`)
          .join(", ") || "-",
      inline: true,
    },
    {
      name: "Theme",
      value:
        randomAnime.themes.map((theme) => `${theme.name}`).join(", ") || "-",
      inline: true,
    },
    {
      name: "Demographics",
      value:
        randomAnime.demographics
          .map((demographic) => `${demographic.name}`)
          .join(", ") || "-",
      inline: true,
    },
    {
      name: "Rating",
      value: randomAnime.rating ?? "-",
      inline: true,
    },
    {
      name: "Score",
      value: randomAnime.score
        ? getFormattedScore(randomAnime.score, randomAnime.scored_by)
        : "-",
    },
  ];
  const embeds: (APIEmbed | JSONEncodable<APIEmbed>)[] = [
    {
      color: 15418782,
      author: {
        name: `Rank #${randomAnime.rank ?? "-"} | Popularity #${
          randomAnime.popularity ?? "-"
        }`,
      },
      title: `${randomAnime.title ?? "-"}`,
      image: {
        url: randomAnime.images.jpg.large_image_url,
      },
      fields,
      timestamp: new Date().toISOString(),
      url: randomAnime.url,
    },
  ];

  if (randomAnime.background) {
    embeds.push({
      color: 0xefff00,
      title: `Background`,
      description: randomAnime.background.slice(0, 4000),
    });
  }

  return embeds;
};

export default getEmbedsFromAnime;
