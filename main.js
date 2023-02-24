require('./lib/dotenv');
const NightMarketDataService = require('./lib/night-market-data.service')
const { Client, Events, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
//const { getValues } = require('./lib/night-market-data.service')
// cdc: commented because we use env variables to pass token
//const { token } = require('./config.json');

const token = process.env.DISCORD_TOKEN;

console.log(token)

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    let channel = c.channels.cache.find(channel => channel.name === 'bot-commands');

    // let thread = await channel.threads.create({
    //     name: "friday 1.13 pickups",
    // })
});

client.on('messageCreate', async (message) => {
    if (message.channel.id === "bot-commands") {
        console.log('hi')
    }
})

const orgsListP = NightMarketDataService.getOrgNameList()
    .then(a => a.map(a => (
        {
            label: a[0],
            description: 'This is ' + a[0],
            value: a[0].replace(' ', '_').toLowerCase(),
        }
    )))

client.on('messageCreate', async interaction => {
    console.log(interaction.content)
    //if (!interaction.isChatInputCommand()) return;

    const orgList = await orgsListP
    console.log(orgList.slice(0, 10))
    if (interaction.content === 'org') {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Nothing selected')
                    .addOptions(
                        ...(orgList.slice(0, 10))
                    ),
            );

        await interaction.reply({ content: 'Pong!', components: [row] });
    }
});

// Log in to Discord with your client's token
client.login(token);
