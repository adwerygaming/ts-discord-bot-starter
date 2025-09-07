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

export interface DropdownLayout {
  id: string;
  execute: (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => Promise<any>;
}

export interface ButtonLayout {
  id: string;
  execute: (client: Client, interaction: ButtonInteraction, data: string[]) => Promise<any>;
}
