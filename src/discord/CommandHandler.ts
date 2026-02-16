import { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, Collection, Colors, ContainerBuilder, Interaction, MessageFlags, ModalSubmitInteraction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { ButtonLayout, DropdownLayout, ModalLayout, SlashCommandLayout } from '../types/DiscordTypes.js';
import { env } from '../utils/EnvManager.js';
import tags from '../utils/Tags.js';
import client from './Client.js';

const botToken = env.DISCORD_TOKEN;
const clientID = env.DISCORD_CLIENT_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname);

interface LoadSlashCommandsGroupData {
    name: string,
    description: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any[]
}

export class CommandHandler {
    private readonly commands = new Collection<string, SlashCommandLayout>();
    private readonly dropdowns = new Collection<string, DropdownLayout>();
    private readonly modals = new Collection<string, ModalLayout>();
    private readonly buttons = new Collection<string, ButtonLayout>();
    private readonly commandData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    public async loadCommands(dir = path.join(srcDir, "commands")): Promise<void> {
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

    public async loadDropdowns(dir = path.join(srcDir, "dropdowns")): Promise<void> {
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

    public async loadButtons(dir = path.join(srcDir, "buttons")): Promise<void> {
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

    public async loadModals(dir = path.join(srcDir, "modals")): Promise<void> {
        if (!fs.existsSync(dir)) {
            console.log(`[${tags.CommandImporter}] Modals directory not found, skipping...`);
            return;
        }

        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                await this.loadModals(fullPath);
            } else if (file.endsWith('.js') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))) {
                try {
                    const { default: modal }: { default: ModalLayout } = await import(pathToFileURL(fullPath).href);
                    if (!modal.id || !modal.execute) {
                        console.warn(`[${tags.CommandImporter}] Modal at ${fullPath} missing id or execute`);
                        continue;
                    }
                    this.modals.set(modal.id, modal);
                    console.log(`[${tags.CommandImporter}] Loaded modal: ${modal.id}`);
                } catch (err) {
                    console.error(`[${tags.Error}] Error loading modal ${fullPath}:`, err);
                }
            }
        }
    }

    public async registerCommands(): Promise<void> {
        if (!botToken || !clientID) {
            console.error('DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in your environment to register commands.');
            return
        }

        const startTime = Date.now()
        const rest = new REST({ version: '10' }).setToken(botToken);

        try {
            console.log(`[${tags.CommandRegister}] Submitting ${this.commandData.length} slash command${this.commandData.length > 1 ? "s" : ""} to Discord REST API....`);
            await rest.put(
                Routes.applicationCommands(clientID),
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
        } else if (interaction.isModalSubmit()) {
            await this.handleModal(interaction);
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
            const noCommandContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`Couldn't find **${commandName}**. Try again later.`)
                )

            try {
                await interaction.reply({
                    components: [noCommandContainer],
                    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                })
            } catch {
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
            const commandErrorContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`There was an error while executing this command.`)
                )

            try {
                await interaction.reply({
                    components: [commandErrorContainer],
                    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                })
            } catch {
                console.log(`[${tags.Error}] Failed to send follow up error message.`)
            }

            // sometimes discord returned unknown interaction
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        components: [commandErrorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    });
                } else {
                    await interaction.reply({
                        components: [commandErrorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    });
                }
            } catch {
                console.log(`[${tags.Error}] Failed to send follow up error message.`)
            }
        }
    }

    private async handleDropdown(interaction: AnySelectMenuInteraction): Promise<void> {
        const [customId, originalUserId, ...rest] = interaction.customId.split('_');

        console.log(`[${tags.Debug}] Interaction UserId: ${interaction.user.id}`)
        console.log(`[${tags.Debug}] Original UserId: ${originalUserId}`)
        console.log(`[${tags.Debug}] Same user? ${(interaction.user.id === originalUserId) ? "Yes" : "No"}`)

        if (interaction.user.id !== originalUserId) {
            const notTheirsContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`This is not your interaction.`)
                )

            await interaction.reply({
                components: [notTheirsContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            });
            return;
        }

        const dropdown = this.dropdowns.get(customId ?? '');
        if (!dropdown) {
            const noDropdownContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`Couldn't find dropdown handler for **${customId}**. Try again later.`)
                )

            await interaction.reply({
                components: [noDropdownContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            });
            return;
        }

        try {
            await dropdown.execute(client, interaction, rest);
        } catch (err) {
            console.error(`[${tags.CommandRegister}] Error handling dropdown ${customId}:`, err);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`There was an error handling this dropdown.`)
                )

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        components: [errorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    })
                } else {
                    await interaction.reply({
                        components: [errorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    });
                }
            } catch (e) {
                console.log(`[${tags.Discord}] Error sending error catch message: ${e}`);
            }
        }
    }

    private async handleButton(interaction: ButtonInteraction): Promise<void> {
        const [customId, originalUserId, ...rest] = interaction.customId.split('_');

        if (interaction.user.id !== originalUserId) {
            const notTheirsContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`This is not your interaction.`)
                )

            await interaction.reply({
                components: [notTheirsContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            });
            return;
        }

        const button = this.buttons.get(customId ?? '');

        if (!button) {
            const noButtonContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`Couldn't find button handler for **${customId}**. Try again later.`)
                )

            await interaction.reply({
                components: [noButtonContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            });
            return;
        }

        try {
            await button.execute(client, interaction, rest);
        } catch (err) {
            console.error(`[${tags.CommandRegister}] Error handling button ${interaction.customId}:`, err);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`There was an error handling this button.'`)
                )

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        components: [errorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    })
                } else {
                    await interaction.reply({
                        components: [errorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    });
                }
            } catch (e) {
                console.log(`[${tags.Discord}] Error sending error catch message: ${e}`);
            }
        }
    }

    private async handleModal(interaction: ModalSubmitInteraction): Promise<void> {
        const [customId, originalUserId, ...rest] = interaction.customId.split('_');

        console.log(`[${tags.Debug}] Interaction UserId: ${interaction.user.id}`)
        console.log(`[${tags.Debug}] Original UserId: ${originalUserId}`)
        console.log(`[${tags.Debug}] Same user? ${(interaction.user.id === originalUserId) ? "Yes" : "No"}`)

        if (interaction.user.id !== originalUserId) {
            const notTheirsContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`This is not your interaction.`)
                )

            await interaction.reply({
                components: [notTheirsContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            });
            return;
        }

        const modal = this.modals.get(customId ?? '');
        if (!modal) {
            const noModalContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`Couldn't find modal handler for **${customId}**. Try again later.`)
                )

            await interaction.reply({
                components: [noModalContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            });
            return;
        }

        try {
            await modal.execute(client, interaction, rest);
        } catch (err) {
            console.error(`[${tags.CommandRegister}] Error handling modal ${customId}:`, err);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent(`There was an error handling this modal.`)
                )

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        components: [errorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    })
                } else {
                    await interaction.reply({
                        components: [errorContainer],
                        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                    });
                }
            } catch (e) {
                console.log(`[${tags.Discord}] Error sending error catch message: ${e}`);
            }
        }
    }
}