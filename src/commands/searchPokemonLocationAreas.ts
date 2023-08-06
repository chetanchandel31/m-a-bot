import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import Fuse from "fuse.js";
import { SlashCommand } from "src/types";
import { getPokemonLocationAreas } from "../helpers/getPokemonLocationAreas";
import { pokemonNameToIdMap } from "../helpers/pokemonNameToIdMap";

const commandOptionsNames = { POKEMON_NAME: "pokemon-name" } as const;

const handleAutocomplete = async (
  interaction: AutocompleteInteraction<CacheType>
) => {
  const focusedValue = interaction.options.getFocused();
  const choices = Object.keys(pokemonNameToIdMap) ?? [];

  const fuse = new Fuse(choices, {
    keys: ["name"],
    threshold: 0.4,
  });

  const filtered = focusedValue
    ? fuse.search(focusedValue).map(({ item }) => item)
    : choices;

  await interaction.respond(
    filtered
      .map((choice) => ({
        name: choice,
        value: choice,
      }))
      .slice(0, 25)
  );
};

const handleExecute = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  await interaction.deferReply();
  const pokemonName = interaction.options.getString(
    commandOptionsNames.POKEMON_NAME
  ) as string;

  if (!pokemonNameToIdMap[pokemonName]) {
    return await interaction.editReply("No such pokemon found");
  }

  const result = await getPokemonLocationAreas({ pokemonName });

  if (result.isError) {
    await interaction.editReply(`
  \`\`\`
${JSON.stringify(result, null, 2)}
  \`\`\`
  `);
  } else {
    const versionToLocationAreaMap: {
      [version: string]: {
        locationAreaName: string;
        minLevel: number;
        maxLevel: number;
      }[];
    } = {};

    result.data.forEach((locationArea) => {
      locationArea.version_details.forEach((version) => {
        const locationAreaName = locationArea.location_area.name;
        const minLevel = Math.min(
          ...version.encounter_details.map((encounter) => encounter.min_level)
        );
        const maxLevel = Math.max(
          ...version.encounter_details.map((encounter) => encounter.max_level)
        );

        if (versionToLocationAreaMap[version.version.name]) {
          versionToLocationAreaMap[version.version.name].push({
            locationAreaName,
            maxLevel,
            minLevel,
          });
        } else {
          versionToLocationAreaMap[version.version.name] = [
            { locationAreaName, maxLevel, minLevel },
          ];
        }
      });
    });

    let hasSentLocations = false;

    for (const version of Object.keys(versionToLocationAreaMap)) {
      const versionDetails = versionToLocationAreaMap[version];
      const description = versionDetails
        .map(
          (locationArea) =>
            `${locationArea.locationAreaName.replaceAll("-", " ")}`
        )
        .join("\n");
      const longDescription = versionDetails
        .map((locationArea) => {
          const lvlText =
            locationArea.minLevel !== locationArea.maxLevel
              ? `(lvl ${locationArea.minLevel}-${locationArea.maxLevel})`
              : `(lvl ${locationArea.minLevel})`;
          return `${locationArea.locationAreaName.replaceAll(
            "-",
            " "
          )} ${lvlText}`;
        })
        .join("\n");

      if (versionDetails) {
        await interaction.followUp({
          content: "",
          embeds: [
            {
              color: 0xefff00,
              title: `GAME: ${version}${
                longDescription.length > 4000 ? " LIMIT EXCEEDED" : ``
              }`,
              author: { name: `POKEMON: ${pokemonName}` },
              image: {
                url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNameToIdMap[pokemonName]}.png`,
              },
              timestamp: new Date().toISOString(),
              description: `${
                description.length <= 2000
                  ? longDescription.slice(0, 4000)
                  : description.slice(0, 4000)
              }`,
            },
          ],
        });
        hasSentLocations = true;
      }
    }

    if (!hasSentLocations) {
      await interaction.editReply(
        `No locations found :smiling_face_with_tear:`
      );
    }
  }
};

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("search-pokemon-location-areas")
    .setDescription("Enter a pokemon and get related location areas")
    .addStringOption((option) =>
      option
        .setName(commandOptionsNames.POKEMON_NAME)
        .setDescription("Name of the pokemon")
        .setRequired(true)
        .setAutocomplete(true)
        .setMaxLength(70)
    ),

  autocomplete: handleAutocomplete,

  execute: handleExecute,
};
