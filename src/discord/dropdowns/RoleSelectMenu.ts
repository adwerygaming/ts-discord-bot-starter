import { AnySelectMenuInteraction, Client, Colors, EmbedBuilder } from "discord.js";
import { DropdownLayout } from "../../types/DiscordTypes.js";

export default {
    id: "exampleRoleSelectMenu",
    execute: async (_client: Client, interaction: AnySelectMenuInteraction) => {
        if (!interaction.isStringSelectMenu()) return

        // continuing from example/dropdown.ts,
        const selectedOptions = interaction.values // this will be array of role color (the lowercased one)

        await interaction.deferReply()

        const updatedEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`You've selected **${selectedOptions.join(", ")}**`)

        await interaction.editReply({
            embeds: [updatedEmbed],
            components: []
        })
    }
} as DropdownLayout;
