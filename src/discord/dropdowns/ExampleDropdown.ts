
import { StringSelectMenuInteraction, Client } from "discord.js";
import { DropdownLayout } from "../../types/DiscordTypes.js";

export default {
    id: "exampleDropdown",
    execute: async (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => {
        await interaction.reply(`You selected: ${interaction.values.join(", ")}`);
    }
} as DropdownLayout;
