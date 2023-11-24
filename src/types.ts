import {
  SlashCommandBuilder,
  Collection,
  PermissionResolvable,
  Message,
  AutocompleteInteraction,
  Client,
  ChatInputCommandInteraction,
  APIEmbed,
  JSONEncodable,
} from "discord.js";

export type TypeResult<T> =
  | { isSuccess: true; result: T }
  | { isSuccess: false; errorMessage: string; error?: Error };

export type TypeDiscordEmbed = APIEmbed | JSONEncodable<APIEmbed>;

export interface HeroListItem {
  name: string;
  heroid: string;
  key: string;
}
export interface Genre {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}
interface initialFetchedData {
  heroesList: HeroListItem[];
  genreList: Genre[];
}
export interface CustomClient extends Client {
  commands?: Collection<string, SlashCommand>;
  initialFetchedData?: initialFetchedData;
}

export interface SlashCommand {
  data: SlashCommandBuilder | any;
  execute: (interaction: ChatInputCommandInteraction) => unknown;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}

export interface Command {
  name: string;
  execute: (message: Message, args: Array<string>) => void;
  permissions: Array<PermissionResolvable>;
  aliases: Array<string>;
  cooldown?: number;
}

interface GuildOptions {
  prefix: string;
}

export type GuildOption = keyof GuildOptions;

export interface SingleHeroDetails {
  code: number;
  message: string;
  data: {
    cover_picture: string;
    gallery_picture: string;
    // junling: "";
    // cost: "";
    // des: "";
    mag: string;
    phy: string;
    alive: string;
    diff: string;
    name: string;
    type: string;
    skill: {
      skill: {
        name: string;
        icon: string;
        des: string;
        tips: string;
      }[];
      item: {
        main: {
          icon: string;
        };
        secondary: {
          icon: string;
        };
        battle_first: {
          icon: string;
        };
        battle_second: {
          icon: string;
        };
        tips: string;
      };
    };
    gear: {
      out_pack: {
        equipment_id: number;
        equip: {
          icon: string;
          name: string;
          des: string[];
        };
      }[];
      out_pack_tips: string;
      verysix: [];
    };
    counters: {
      best: {
        heroid: string;
        best_mate_tips: string;
        name: string;
        icon: string;
      };
      counters: {
        heroid: string;
        restrain_hero_tips: string;
        name: string;
        icon: string;
      };
      countered: {
        heroid: string;
        by_restrain_tips: string;
        name: string;
        icon: string;
      };
    };
  };
}
// export interface BotEvent {
//     name: string,
//     once?: boolean | false,
//     execute: (...args?) => void
// }

// declare global {
//   namespace NodeJS {
//     interface ProcessEnv {
//       TOKEN: string;
//       CLIENT_ID: string;
//       PREFIX: string;
//       MONGO_URI: string;
//       MONGO_DATABASE_NAME: string;
//     }
//   }
// }

// declare module "discord.js" {
//   export interface Client {
//     slashCommands: Collection<string, SlashCommand>;
//     commands: Collection<string, Command>;
//     cooldowns: Collection<string, number>;
//   }
// }

/** jikan */
export type JikanErrorResponse = {
  status: number;
  type: string;
  message: string;
  error: string;
  report_url: string;
};

interface Datum {
  mal_id: number;
  url: string;
  images: { jpg: Image; webp: Image };
  trailer: Trailer;
  approved: boolean;
  titles: Title[];
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: Aired;
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string | null;
  season: string;
  year: number;
  broadcast: Broadcast;
  producers: Demographic[];
  licensors: Demographic[];
  studios: Demographic[];
  genres: Demographic[];
  explicit_genres: Demographic[];
  themes: Demographic[];
  demographics: Demographic[];
}

interface Aired {
  from: Date;
  to: Date;
  prop: Prop;
  string: string | null;
}

interface Prop {
  from: From;
  to: From;
}

interface From {
  day: number;
  month: number;
  year: number;
}

interface Broadcast {
  day: string;
  time: string;
  timezone: string;
  string: string;
}

interface Demographic {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

interface Image {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

interface Title {
  type: string;
  title: string;
}

interface Trailer {
  youtube_id: null | string;
  url: null | string;
  embed_url: null | string;
  images: Images;
}

interface Images {
  image_url: null | string;
  small_image_url: null | string;
  medium_image_url: null | string;
  large_image_url: null | string;
  maximum_image_url: null | string;
}

interface Pagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: Items;
}

interface Items {
  count: number;
  total: number;
  per_page: number;
}

export interface AnimeSearchResponse {
  pagination: Pagination;
  data: Datum[];
}
