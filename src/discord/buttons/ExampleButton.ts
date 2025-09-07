
import { ButtonInteraction, Client } from "discord.js";
import { ButtonLayout } from "../../types/DiscordTypes.js";

export default {
    id: "exampleButton",
    execute: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        await interaction.reply("You clicked the example button!");
    }
} as ButtonLayout;
