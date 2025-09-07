
import { ButtonInteraction, Client, Colors, EmbedBuilder } from "discord.js";
import { ButtonLayout } from "../../types/DiscordTypes.js";

export default {
    id: "exampleButton",
    execute: async (_client: Client, interaction: ButtonInteraction, data: string[]) => {
        // on example/button.ts, this will return our additional passed data. "btn1" to "btn5"
        const btnID = data[0]

        await interaction.deferReply()

        const successEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ You've selected ${btnID}.`)

        await interaction.editReply({
            embeds: [successEmbed],
            components: []
        })
    }
} as ButtonLayout;
