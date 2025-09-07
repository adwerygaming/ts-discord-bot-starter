import { SlashCommandBuilder } from "discord.js";
import { SlashCommandLayout } from "../../types/DiscordTypes.js";
import { Client, ChatInputCommandInteraction } from "discord.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong!"),
    execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.reply("Pong!");
    }
} as SlashCommandLayout;