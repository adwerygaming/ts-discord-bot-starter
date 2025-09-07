import { SlashCommandBuilder, Client, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, Colors } from "discord.js";
import { SlashCommandLayout } from "../../../types/DiscordTypes.js";

export default {
    metadata: new SlashCommandBuilder()
    .setName("button")
    .setDescription("Example of buttons."),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        const btn1 = new ButtonBuilder()
        .setLabel("Button 1")
        .setCustomId(`exampleButton_${interaction.user.id}_btn1`)
        .setStyle(ButtonStyle.Secondary)

        const btn2 = new ButtonBuilder()
        .setLabel("Button 2")
        .setCustomId(`exampleButton_${interaction.user.id}_btn2`)
        .setStyle(ButtonStyle.Secondary)

        const btn3 = new ButtonBuilder()
        .setLabel("Button 3")
        .setCustomId(`exampleButton_${interaction.user.id}_btn3`)
        .setStyle(ButtonStyle.Secondary)

        const btn4 = new ButtonBuilder()
        .setLabel("Button 4")
        .setCustomId(`exampleButton_${interaction.user.id}_btn4`)
        .setStyle(ButtonStyle.Secondary)

        const btn5 = new ButtonBuilder()
        .setLabel("Button 5")
        .setCustomId(`exampleButton_${interaction.user.id}_btn5`)
        .setStyle(ButtonStyle.Secondary)

        const rowsOfButtons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(btn1, btn2, btn3, btn4, btn5)

        const embed = new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setDescription("Please select a button.")

        await interaction.reply({
            embeds: [embed],
            components: [rowsOfButtons]
        })
    },
} as SlashCommandLayout