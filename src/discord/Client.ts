import { GatewayIntentBits, Client } from 'discord.js';
const BotToken = process.env.OUKA_DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

void client.login(BotToken);

export default client;