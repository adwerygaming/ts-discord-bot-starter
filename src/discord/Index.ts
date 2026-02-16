import { Client, Events } from 'discord.js';
import tags from '../utils/Tags.js';
import client from './Client.js';

console.log(`[${tags.System}] Loaded Discord Index Script.`)

import { CommandHandler } from './CommandHandler.js';

const commandHandler = new CommandHandler();

client.on(Events.ClientReady, async (bot: Client) => {
  // loads commands
  await commandHandler.loadCommands();
  await commandHandler.loadDropdowns();
  await commandHandler.loadButtons();

  // register commands to discord
  await commandHandler.registerCommands();

  console.log('');
  console.log(`[${tags.Discord}] Connected to Discord API.`);
  console.log(`[${tags.Discord}] Bot Information:`);
  console.log(`[${tags.Discord}] ID           : ${bot?.user?.id ?? '-'}`);
  console.log(`[${tags.Discord}] Username     : ${bot?.user?.username ?? '-'}`);
  console.log(`[${tags.Discord}] Display Name : ${bot?.user?.displayName ?? '-'}`);
  console.log(`[${tags.Discord}] Tags         : ${bot?.user?.discriminator ?? '-'}`);
  console.log(`[${tags.Discord}] Servers      : ${bot?.guilds.cache.size ?? '-'} Server${bot?.guilds?.cache?.size > 1 ? 's' : ''}`);
  console.log('');

});

client.on(Events.InteractionCreate, async interaction => {
  await commandHandler.handleInteraction(interaction);
});
