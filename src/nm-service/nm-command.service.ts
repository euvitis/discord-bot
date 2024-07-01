// export async function loadCommands
// export async function publishCommands

import {
    REST,
    Routes,
    Collection,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    CacheType
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

interface Command {
    data: SlashCommandBuilder;
    get_data(): Promise<SlashCommandBuilder>;
    execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}

export async function loadCommands() {
    const commands = new Collection<string, Command>();

    const dir = path.join(__dirname, '../commands');

    for (const file of fs
        .readdirSync(dir)
        .filter((file) => file.endsWith('.js'))) {
        const command = require(path.join(dir, file));

        if ('get_data' in command && 'execute' in command) {
            const data: SlashCommandBuilder = await command.get_data();
            commands.set(data.name, { data, ...command });
        } else {
            console.log(
                `WRN The command at ${file} is missing a required "get_data" or "execute" property.`
            );
        }
    }

    return commands;
}

export async function publishCommands(commands: Collection<string, Command>) {
    // const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    // await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
    //     body: [...commands.values()].map(({ data }) => data.toJSON())
    // });

    // console.log(`Successfully reloaded (/) commands.`);
}
