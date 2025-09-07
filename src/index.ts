import client from './discord/Client.js';
import { NewCommandHandler } from './discord/NewCommandHandler.js';

async function main() {
    const commandHandler = new NewCommandHandler();
    await commandHandler.loadCommands();
    await commandHandler.registerCommands();

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        await commandHandler.handleInteraction(interaction);
    });

    await client.login(process.env.DISCORD_TOKEN);
}

main().catch(console.error);