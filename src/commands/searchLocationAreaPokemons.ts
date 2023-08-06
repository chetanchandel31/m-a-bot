import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import Fuse from "fuse.js";
import { SlashCommand } from "src/types";
import { locationAreaNameToIdMap } from "../helpers/locationAreaNameToIdMap";
import { getLocationAreaPokemons } from "../helpers/getLocationAreaPokemons";

const commandOptionsNames = {
  LOCATION_AREA_NAME: "location-area-name",
} as const;

const handleAutocomplete = async (
  interaction: AutocompleteInteraction<CacheType>
) => {
  const focusedValue = interaction.options.getFocused();
  const choices = Object.keys(locationAreaNameToIdMap) ?? [];

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
        name: choice.replaceAll("-", " "),
        value: choice,
      }))
      .slice(0, 25)
  );
};

const handleExecute = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  await interaction.deferReply();
  const locationAreaName = interaction.options.getString(
    commandOptionsNames.LOCATION_AREA_NAME
  ) as string;

  if (!locationAreaNameToIdMap[locationAreaName]) {
    return await interaction.editReply("No such location area found");
  }

  const result = await getLocationAreaPokemons({ locationAreaName });

  if (result.isError) {
    await interaction.editReply(`
  \`\`\`
${JSON.stringify(result, null, 2)}
  \`\`\`
  `);
  } else {
    const versionToLocationAreaMap: {
      [version: string]: {
        pokemonName: string;
        minLevel: number;
        maxLevel: number;
      }[];
    } = {};

    result.data.pokemon_encounters.forEach((encounter) => {
      encounter.version_details.forEach((version) => {
        const pokemonName = encounter.pokemon.name;
        const minLevel = Math.min(
          ...version.encounter_details.map((encounter) => encounter.min_level)
        );
        const maxLevel = Math.max(
          ...version.encounter_details.map((encounter) => encounter.max_level)
        );

        if (versionToLocationAreaMap[version.version.name]) {
          versionToLocationAreaMap[version.version.name].push({
            pokemonName,
            maxLevel,
            minLevel,
          });
        } else {
          versionToLocationAreaMap[version.version.name] = [
            { pokemonName, maxLevel, minLevel },
          ];
        }
      });
    });

    let hasSentPokemons = false;

    for (const version of Object.keys(versionToLocationAreaMap)) {
      const versionDetails = versionToLocationAreaMap[version];
      const description = versionDetails
        .map((pokemon) => `${pokemon.pokemonName.replaceAll("-", " ")}`)
        .join("\n");
      const longDescription = versionDetails
        .map((pokemon) => {
          const lvlText =
            pokemon.minLevel !== pokemon.maxLevel
              ? `(lvl ${pokemon.minLevel}-${pokemon.maxLevel})`
              : `(lvl ${pokemon.minLevel})`;
          return `${pokemon.pokemonName.replaceAll("-", " ")} ${lvlText}`;
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
              author: {
                name: `LOCATION AREA: ${result.data.location.name.replaceAll(
                  "-",
                  " "
                )} -> ${locationAreaName.replaceAll("-", " ")}`,
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
        hasSentPokemons = true;
      }
    }

    if (!hasSentPokemons) {
      await interaction.editReply(`No pokemons found :smiling_face_with_tear:`);
    }
  }
};

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("search-location-area-pokemons")
    .setDescription("Enter a location area and get related pokemons")
    .addStringOption((option) =>
      option
        .setName(commandOptionsNames.LOCATION_AREA_NAME)
        .setDescription("Name of the location area")
        .setRequired(true)
        .setAutocomplete(true)
        .setMaxLength(70)
    ),

  autocomplete: handleAutocomplete,

  execute: handleExecute,
};
