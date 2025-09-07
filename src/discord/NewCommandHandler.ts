
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { ChatInputCommandInteraction, Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js';
import { REST, Routes, Collection } from 'discord.js';
import type { SlashCommandLayout } from '../types/DiscordTypes.js';
import client from './Client.js';
import tags from '../utils/Tags.js';
import { _dirname } from '../utils/Path.js';

const BotToken = process.env.OUKA_DISCORD_TOKEN!;
const ClientID = process.env.OUKA_DISCORD_CLIENT_ID!;

if (!BotToken || !ClientID) {
    throw new Error('⚠️ DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in your environment');
}

const srcDir = path.join(_dirname, "..");

export class NewCommandHandler {
    private readonly commands = new Collection<string, SlashCommandLayout>();
    private readonly commandData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    public async loadCommands(dir = path.join(srcDir, "discord", "commands")): Promise<void> {
        const commandFiles = fs.readdirSync(dir);

        for (const file of commandFiles) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const subFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
                const group = new Collection<string, SlashCommandLayout>();
                const groupData: any = {
                    name: file.toLowerCase(),
                    description: `${file} commands`,
                    options: [],
                };

                for (const subFile of subFiles) {
                    const subFilePath = path.join(fullPath, subFile);
                    const { default: command } = await import(pathToFileURL(subFilePath).href) as { default: SlashCommandLayout };
                    
                    if (command.metadata) {
                        const commandName = command.metadata.name;
                        group.set(commandName, command);
                        groupData.options.push(command.metadata.toJSON());
                        this.commands.set(`${file}/${commandName}`, command);
                    }
                }
                this.commandData.push(groupData);

            } else if (file.endsWith('.js') || file.endsWith('.ts')) {
                const { default: command } = await import(pathToFileURL(fullPath).href) as { default: SlashCommandLayout };
                if (command.metadata) {
                    this.commands.set(command.metadata.name, command);
                    this.commandData.push(command.metadata.toJSON());
                }
            }
        }
    }

    public async registerCommands(): Promise<void> {
        const rest = new REST({ version: '10' }).setToken(BotToken);

        try {
            console.log(`[${tags.CommandRegister}] Started refreshing application (/) commands.`);
            await rest.put(
                Routes.applicationCommands(ClientID),
                { body: this.commandData },
            );
            console.log(`[${tags.CommandRegister}] Successfully reloaded application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    }

    public async handleInteraction(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        let commandName = interaction.commandName;
        const subCommand = interaction.options.getSubcommand(false);
        if (subCommand) {
            commandName += `/${subCommand}`;
        }
        
        const command = this.commands.get(commandName);

        if (!command) {
            console.error(`No command matching ${commandName} was found.`);
            return;
        }

        try {
            if (command.execute) {
                await command.execute(client, interaction);
            }
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}
