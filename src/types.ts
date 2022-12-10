import {
  SlashCommandBuilder,
  Collection,
  PermissionResolvable,
  Message,
  AutocompleteInteraction,
  Client,
  ChatInputCommandInteraction,
} from "discord.js";

export interface HeroListItem {
  name: string;
  heroid: string;
  key: string;
}
interface initialFetchedData {
  heroesList: HeroListItem[];
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
