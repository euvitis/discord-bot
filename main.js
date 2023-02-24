require('./lib/dotenv');

const { Client, Events, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, Collection } = require('discord.js');
const { getValues } = require('./lib/sheets')
const { loadCommands } = require('./lib/commands');

const token = process.env.DISCORD_TOKEN
if (!token) console.err("ERR No Token Found! Read README.md for more information.")

// load orgs from spread sheet
const orgsListP = getValues("Org!B2:B")
    .then(a => a.filter(a => a[0]))
    .then(a => a.map(a => (
        {
            label: a[0],
            description: 'This is ' + a[0],
            value: a[0].replace(' ', '_').toLowerCase(),
        }
    )))


async function main() {
    // create a new client instance
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            // GatewayIntentBits.GuildMessages,
            // GatewayIntentBits.MessageContent
        ]
    });

    client.commands = await loadCommands();

    // when the client is ready, run this code (only once)
    // we use 'c' for the event parameter to keep it separate from the already defined 'client'
    client.once(Events.ClientReady, async c => {
        console.log(`Ready! Logged in as ${c.user.tag}`);

        let channel = c.channels.cache.find(channel => channel.name === 'bot-commands');

        // let thread = await channel.threads.create({
        //     name: "friday 1.13 pickups",
        // })
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

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
    client.login(token);
}

main()