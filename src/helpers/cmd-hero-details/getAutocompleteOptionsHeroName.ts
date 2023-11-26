import { CustomClient } from "../../types";
import Fuse from "fuse.js";

type Params = {
  initialFetchedData: CustomClient["initialFetchedData"];
  searchQuery: string;
};

const getAutocompleteOptionsHeroName = ({
  initialFetchedData,
  searchQuery,
}: Params) => {
  const choices = initialFetchedData?.heroesList || [];

  const fuse = new Fuse(choices, {
    keys: ["name"],
    threshold: 0.4,
  });

  const filtered = searchQuery
    ? fuse.search(searchQuery).map(({ item }) => item)
    : choices;

  const autoCompleteOptions = filtered
    .map((choice) => ({
      name: choice.name,
      value: choice.name,
    }))
    .slice(0, 25);

  return autoCompleteOptions;
};

export default getAutocompleteOptionsHeroName;
