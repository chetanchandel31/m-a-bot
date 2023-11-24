import { SingleHeroDetails, TypeResult } from "src/types";
import { request } from "undici";

const fetchHeroDetailsByHeroId = async (heroId: string) => {
  let result: TypeResult<SingleHeroDetails>;

  try {
    const heroDetailsResult = await request(
      `https://mapi.mobilelegends.com/hero/detail?id=${heroId}`
    );
    const heroDetails: SingleHeroDetails = await heroDetailsResult.body.json();

    // TODO: zod schema if needed

    result = { isSuccess: true, result: heroDetails };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      result = {
        isSuccess: false,
        error: error,
        errorMessage: error.message,
      };
    } else {
      result = {
        isSuccess: false,
        errorMessage: "Unknown error",
      };
    }
  }

  return result;
};

export default fetchHeroDetailsByHeroId;
