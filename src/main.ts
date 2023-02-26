import { loadCommands } from './lib/commands';
import { DISCORD_TOKEN } from './lib/dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';

async function main() {
    const client = new Client({
        intents: [GatewayIntentBits.Guilds]
    });

    const commands = await loadCommands();

    client.once(Events.ClientReady, async (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    });

    // Log in to Discord with your client's token
    client.login(DISCORD_TOKEN);
}

main()