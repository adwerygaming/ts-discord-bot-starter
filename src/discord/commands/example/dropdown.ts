import { SlashCommandBuilder, Client, ChatInputCommandInteraction, ActionRowBuilder, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { SlashCommandLayout } from "../../../types/DiscordTypes.js";

export default {
    metadata: new SlashCommandBuilder()
    .setName("dropdown")
    .setDescription("Example of dropdown/select menu."),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {

        // customId must be {yourCustomDropdownID}_{interaction.user.id}
        // if you want to pass another single data, add "_" + something after it.
        // -> {yourCustomDropdownID}_{interaction.user.id}_data1_data2_data3

        const roleColorSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(`exampleRoleSelectMenu_${interaction.user.id}`) 
            .setPlaceholder("Pick a role color.")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Green')
                    .setValue('green')
                    .setEmoji("🟢"),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Red')
                    .setValue('red')
                    .setEmoji("🔴"),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Yellow')
                    .setValue('yellow')
                    .setEmoji("🟡"),
                new StringSelectMenuOptionBuilder()
                    .setLabel('orange')
                    .setValue('orange')
                    .setEmoji("🟠"),
                new StringSelectMenuOptionBuilder()
                    .setLabel('purple')
                    .setValue('purple')
                    .setEmoji("🟣"),
            )
            .setMaxValues(3)
            .setMinValues(1)

        const rowsOfButtons = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(roleColorSelectMenu)

        const embed = new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setDescription("Select a role.")

        await interaction.reply({
            embeds: [embed],
            components: [rowsOfButtons]
        })
    },
} as SlashCommandLayout