import { FoodCountInputEvent, FoodCountResponseEvent } from './events';
import { DISCORD_TOKEN } from './dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';

async function main() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });
    // todo: do we want this on every connection?
    // const commands = await loadCommands();
    // client.on(Events.InteractionCreate, async (c) => {
    //     console.log(c);
    //     console.log(`Hi!`);
    // });
    client.once(Events.ClientReady, async (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });
    // todo: this will file on every message sent. we probably
    // want a big switchboard and fire different stuff depending on
    // parameters
    client.on(Events.MessageCreate, FoodCountInputEvent);

    // todo: this will file on every interaction sent. we probably
    // want a big switchboard and fire different stuff depending on
    // parameters
    client.on(Events.InteractionCreate, FoodCountResponseEvent);

    client.login(DISCORD_TOKEN);
}

main();
