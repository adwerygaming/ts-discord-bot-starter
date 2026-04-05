import type {
    AnySelectMenuInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    ModalSubmitInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export interface SlashCommandLayout {
  metadata: SlashCommandBuilder;
  execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface DropdownLayout {
  id: string;
  execute: (client: Client, interaction: AnySelectMenuInteraction, data: string[]) => Promise<void>;
}

export interface ButtonLayout {
  id: string;
  execute: (client: Client, interaction: ButtonInteraction, data: string[]) => Promise<void>;
}

export interface ModalLayout {
  id: string;
  execute: (client: Client, interaction: ModalSubmitInteraction, data?: string[]) => Promise<void>;
}

export interface UserFilterIteration {
  user: {
    id: string;
  };
}
