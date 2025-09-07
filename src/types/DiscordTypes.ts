import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';

export interface SlashCommandLayout {
  metadata: SlashCommandBuilder
  execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<any>;
}

// For DropdownLayout, you need to use camelCase. Having underscore (_) will break the interaction check
export interface DropdownLayout {
  id: string;
  execute: (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => Promise<any>;
}

// For ButtonLayout, you need to use camelCase. Having underscore (_) will break the interaction check
export interface ButtonLayout {
  id: string;
  execute: (client: Client, interaction: ButtonInteraction, data: string[]) => Promise<any>;
}
