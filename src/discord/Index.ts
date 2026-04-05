import { Client, Events } from 'discord.js';
import tags from '../utils/Tags.js';
import client from './Client.js';

console.log(`[${tags.System}] Loaded Discord Index Script.`);

import { CommandHandler } from './CommandHandler.js';

const commandHandler = new CommandHandler();

client.on(Events.ClientReady, (bot: Client) => {
  void (async (): Promise<void> => {
    await commandHandler.loadCommands();
    await commandHandler.loadDropdowns();
    await commandHandler.loadButtons();
    await commandHandler.loadModals();

    await commandHandler.registerCommands();

    console.log('');
    console.log(`[${tags.Discord}] Connected to Discord API.`);
    console.log(`[${tags.Discord}] Bot Information:`);
    console.log(`[${tags.Discord}] ID           : ${bot.user?.id ?? '-'}`);
    console.log(`[${tags.Discord}] Username     : ${bot.user?.username ?? '-'}`);
    console.log(`[${tags.Discord}] Display Name : ${bot.user?.displayName ?? '-'}`);
    console.log(`[${tags.Discord}] Tags         : ${bot.user?.discriminator ?? '-'}`);
    console.log(`[${tags.Discord}] Servers      : ${bot.guilds.cache.size} Server${bot.guilds.cache.size > 1 ? 's' : ''}`);
    console.log('');
  })().catch((error: unknown) => {
    console.error(`[${tags.Error}] An error occurred during bot ready event.`);
    console.error(error);
  });
});

client.on(Events.InteractionCreate, interaction => {
  void commandHandler.handleInteraction(interaction).catch((error: unknown) => {
    console.error(`[${tags.Error}] An error occurred while handling interaction.`);
    console.error(error);
  });
});
