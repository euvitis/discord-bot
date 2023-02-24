const { REST, Routes, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    loadCommands,
    publishCommands,
}

/**
 * 
 * @returns Collection
 */
async function loadCommands() {
    const commands = new Collection();

    const dir = path.join(__dirname, '../commands');

    for (const file of fs.readdirSync(dir).filter(file => file.endsWith('.js'))) {
        const command = require(path.join(dir, file))

        if ('get_data' in command && 'execute' in command) {
            const data = await command.get_data()
            commands.set(data.name, { data, ...command })
        } else {
            console.log(`WRN The command at ${file} is missing a required "get_data" or "execute" property.`);
        }
    }

    return commands;
}

/**
 * 
 * @param {Collection} commands 
 */
async function publishCommands(commands) {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    const data = await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        {
            body: [...commands.values()].map(({ data }) => data.toJSON())
        }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
}
