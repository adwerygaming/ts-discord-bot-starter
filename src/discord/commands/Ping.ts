import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { SlashCommandLayout } from "../../types/DiscordTypes.js";
import { Client, ChatInputCommandInteraction } from "discord.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong!"),
    execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
        const exampleButton = new ButtonBuilder()
            .setCustomId(`exampleButton_${interaction.user.id}`)
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Primary)

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(exampleButton);

        const dropdownMenu = new StringSelectMenuBuilder()
            .setCustomId(`exampleDropdown_${interaction.user.id}`)
            .setPlaceholder('Select an option')
            .addOptions([
                {
                    label: 'Option 1',
                    value: 'option_1',
                },
                {
                    label: 'Option 2',
                    value: 'option_2',
                },
            ])

        const selectMenuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(dropdownMenu);

        await interaction.reply({ content: "Pong!", components: [buttonRow, selectMenuRow] });
    }
} as SlashCommandLayout;