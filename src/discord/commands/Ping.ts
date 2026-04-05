import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommandLayout } from "../../types/Discord.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's connection and response time."),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.reply({ content: "Pong!" });
    }
} as SlashCommandLayout;
