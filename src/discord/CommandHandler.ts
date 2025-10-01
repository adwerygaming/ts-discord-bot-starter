
import { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, Interaction, MessageFlags, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import type { SlashCommandLayout, DropdownLayout, ButtonLayout } from '../types/DiscordTypes.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { REST, Routes, Collection, EmbedBuilder, Colors } from 'discord.js';
import client from './Client.js';
import tags from '../utils/Tags.js';
import { _dirname } from '../utils/Path.js';
import { env } from '../utils/EnvManager.js';

const BotToken = env.DISCORD_TOKEN!;
const ClientID = env.DISCORD_CLIENT_ID!;

if (!BotToken || !ClientID) {
    throw new Error('⚠️ DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in your environment');
}

const srcDir = path.join(_dirname, "..");

interface LoadSlashCommandsGroupData {
    name: string,
    description: string,
    options: any[]
}

export class CommandHandler {
    private readonly commands = new Collection<string, SlashCommandLayout>();
    private readonly dropdowns = new Collection<string, DropdownLayout>();
    private readonly buttons = new Collection<string, ButtonLayout>();
    private readonly commandData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    public async loadCommands(dir = path.join(srcDir, "discord", "commands")): Promise<void> {
        const commandFiles = fs.readdirSync(dir);

        for (const file of commandFiles) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const subFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
                const group = new Collection<string, SlashCommandLayout>();
                const groupData: LoadSlashCommandsGroupData = {
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
                        console.log(`[${tags.CommandImporter}] Imported ./${file}/${commandName}`)
                    } else {
                        console.log(`[${tags.CommandImporter}] ./${file}/${subFile} dosen't have metadata.`)
                    }
                }

                this.commandData.push(groupData);
            } else if (file.endsWith('.js') || file.endsWith('.ts')) {
                const { default: command } = await import(pathToFileURL(fullPath).href) as { default: SlashCommandLayout };
                if (command.metadata) {
                    this.commands.set(command.metadata.name, command);
                    this.commandData.push(command.metadata.toJSON());
                    console.log(`[${tags.CommandImporter}] Imported ./${command.metadata.name}`)
                } else {
                    console.log(`[${tags.CommandImporter}] ./${file} dosen't have metadata.`)
                }
            }
        }
    }

    public async loadDropdowns(dir = path.join(srcDir, "discord", "dropdowns")): Promise<void> {
        if (!fs.existsSync(dir)) {
            console.log(`[${tags.CommandImporter}] Dropdowns directory not found, skipping...`);
            return;
        }

        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                await this.loadDropdowns(fullPath);
            } else if (file.endsWith('.js') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))) {
                try {
                    const { default: dropdown }: { default: DropdownLayout } = await import(pathToFileURL(fullPath).href);
                    if (!dropdown.id || !dropdown.execute) {
                        console.warn(`[${tags.CommandImporter}] Dropdown at ${fullPath} missing id or execute`);
                        continue;
                    }
                    this.dropdowns.set(dropdown.id, dropdown);
                    console.log(`[${tags.CommandImporter}] Loaded dropdown: ${dropdown.id}`);
                } catch (err) {
                    console.error(`[${tags.Error}] Error loading dropdown ${fullPath}:`, err);
                }
            }
        }
    }

    public async loadButtons(dir = path.join(srcDir, "discord", "buttons")): Promise<void> {
        if (!fs.existsSync(dir)) {
            console.log(`[${tags.CommandImporter}] Buttons directory not found—skipping.`);
            return;
        }
        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                await this.loadButtons(fullPath);
            } else if (file.endsWith('.js') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))) {
                try {
                    const { default: button }: { default: ButtonLayout } = await import(pathToFileURL(fullPath).href);
                    if (!button.id || !button.execute) {
                        console.warn(`[${tags.CommandImporter}] Button at ${fullPath} missing id or execute`);
                        continue;
                    }
                    this.buttons.set(button.id, button);
                    console.log(`[${tags.CommandImporter}] Loaded button: ${button.id}`);
                } catch (err) {
                    console.error(`[${tags.Error}] Error loading button ${fullPath}:`, err);
                }
            }
        }
    }

    public async registerCommands(): Promise<void> {
        const startTime = Date.now()
        const rest = new REST({ version: '10' }).setToken(BotToken);

        try {
            console.log(`[${tags.CommandRegister}] Submitting ${this.commandData.length} slash command${this.commandData.length > 1 ? "s" : ""} to Discord REST API....`);
            await rest.put(
                Routes.applicationCommands(ClientID),
                { body: this.commandData },
            );
            console.log(`[${tags.CommandRegister}] Successfully reloaded application (/) commands.`);
        } catch (error) {
            console.error(error);
        } finally {
            const endTime = Date.now()
            console.log(`[${tags.CommandRegister}] Elapsed: ${endTime - startTime}ms`)
        }
    }

    public async handleInteraction(interaction: Interaction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            await this.handleSlashCommand(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await this.handleDropdown(interaction);
        } else if (interaction.isButton()) {
            await this.handleButton(interaction);
        }
    }

    private async handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        let commandName = interaction.commandName;
        const subCommand = interaction.options.getSubcommand(false);
        if (subCommand) {
            commandName += `/${subCommand}`;
        }
        
        const command = this.commands.get(commandName);

        if (!command) {
            const noCommandEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setDescription(`❌ Couldn't find **${commandName}**. Try again later.`)

            try {
                await interaction.reply({ embeds: [noCommandEmbed], flags: MessageFlags.Ephemeral  })
            } catch (e) {
                console.log(`[${tags.Error}] Failed to send follow up error message.`)
            }

            console.log(`[${tags.Error}] Slash Command ${commandName} couldn't be found.`)
            return;
        }

        try {
            if (command.execute) {
                await command.execute(client, interaction);
            }
        } catch (error) {
            console.error(error);
            const commandErrorEmbed = new EmbedBuilder()
                .setColor(Colors.DarkRed)
                .setDescription(`❌ There was an error while executing this command.`)

            // sometimes discord returned unknown interaction
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [commandErrorEmbed], flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ embeds: [commandErrorEmbed], flags: MessageFlags.Ephemeral });
                }
            } catch (e) {
                console.log(`[${tags.Error}] Failed to send follow up error message.`)
            }
        }
    }

    private async handleDropdown(interaction: AnySelectMenuInteraction): Promise<void> {
        // customId format is:
        // 1. yourCustomId (required)
        // 2. interaction.user.id (required)
        // 3. additional data (if needed, optional)
        // then combined with underscore (_)
        //
        // Correct customId: 
        // - exampleButton_${interaction.user.id}
        // - exampleButton_${interaction.user.id}_confirm
        // - exampleButton_${interaction.user.id}_abort
        // 
        // Invalid customId:
        // - exampleButton  (Missing UserID)
        // - exampleButton_confirm (Missing UserID)
        // - exampleButton_abort (Missing UserID)
        // - exampleButton_abort_${interaction.user.id} (UserID Misplacement)
        //
        // [Quick F.A.Q]
        // Q: Wait, so this interaction is can only executed by the one who executed?
        // A: Yes.
        //
        // Q: But i dont want that, i want other user can also interact with it.
        // A: Well, you have to figure out by youself then.
        
        const [customId, originalUserId, ...rest] = interaction.customId.split('_');

        console.log(`[${tags.Debug}] interaction userid: ${interaction.user.id}`)
        console.log(`[${tags.Debug}] original userid: ${originalUserId}`)

        if (interaction.user.id !== originalUserId) {
            await interaction.reply({content: 'Not your interaction.', flags: MessageFlags.Ephemeral});
            return;
        }

        const dropdown = this.dropdowns.get(customId ?? '');
        if (!dropdown) {
            await interaction.reply({content: 'Dropdown handler not found!', flags: MessageFlags.Ephemeral});
            return;
        }
        
        try {
            await dropdown.execute(client, interaction, rest);
        } catch (err) {
            console.error(`[${tags.CommandRegister}] Error handling dropdown ${customId}:`, err);
            const msg = 'There was an error handling this dropdown.';

            try {
                interaction.replied || interaction.deferred
                    ? await interaction.followUp({content: msg, flags: MessageFlags.Ephemeral})
                    : await interaction.reply({content: msg, flags: MessageFlags.Ephemeral});
            } catch (e) {
                console.log(`[${tags.Discord}] Error sending error catch message: ${e}`);
            }
        }
    }

    private async handleButton(interaction: ButtonInteraction): Promise<void> {
        // customId format is:
        // 1. yourCustomId (required)
        // 2. interaction.user.id (required)
        // 3. additional data (if needed, optional)
        // then combined with underscore (_)
        //
        // Correct customId: 
        // - exampleButton_${interaction.user.id}
        // - exampleButton_${interaction.user.id}_confirm
        // - exampleButton_${interaction.user.id}_abort
        // 
        // Invalid customId:
        // - exampleButton  (Missing UserID)
        // - exampleButton_confirm (Missing UserID)
        // - exampleButton_abort (Missing UserID)
        // - exampleButton_abort_${interaction.user.id} (UserID Misplacement)
        //
        // [Quick F.A.Q]
        // Q: Wait, so this interaction is can only executed by the one who executed?
        // A: Yes.
        //
        // Q: But i dont want that, i want other user can also interact with it.
        // A: Well, you have to figure out by youself then.
        
        const [customId, originalUserId, ...rest] = interaction.customId.split('_');

        if (interaction.user.id !== originalUserId) {
            await interaction.reply({content: 'Not your interaction.', flags: MessageFlags.Ephemeral});
            return;
        }

        const button = this.buttons.get(customId ?? '');

        if (!button) {
            await interaction.reply({content: 'Button handler not found!', flags: MessageFlags.Ephemeral});
            return;
        }

        try {
            await button.execute(client, interaction, rest);
        } catch (err) {
            console.error(`[${tags.CommandRegister}] Error handling button ${interaction.customId}:`, err);
            const msg = 'There was an error handling this button.';
            try {
                interaction.replied || interaction.deferred
                    ? await interaction.followUp({content: msg, flags: MessageFlags.Ephemeral})
                    : await interaction.reply({content: msg, flags: MessageFlags.Ephemeral});
            } catch (e) {
                console.log(`[${tags.Discord}] Error sending error catch message: ${e}`);
            }
        }
    }
}
