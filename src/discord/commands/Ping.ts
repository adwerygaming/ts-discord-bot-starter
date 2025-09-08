import { SlashCommandBuilder } from "discord.js";
import { SlashCommandLayout } from "../../types/DiscordTypes.js";
import { Client, ChatInputCommandInteraction } from "discord.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong!"),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.reply({ content: "Pong!" });
    }
} as SlashCommandLayout;