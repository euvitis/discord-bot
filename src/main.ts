// CRABAPPLE: a discord bot for night market related tasks such as
// - counting food donations in poundage

// why is this file in typescript?

import { FoodCountInputEvent, FoodCountResponseEvent } from './events';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { NmConfigService } from './nm-service';
import { Config } from './config';

async function main() {
    // initialize our bot that can enter guilds & send/read messages
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.once(Events.ClientReady, async (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    // where are our commands loaded?

    // todo: {
    // this will file on every message sent. we probably
    // want a big switchboard and fire different stuff depending on
    // parameters/events
    client.on(Events.MessageCreate, FoodCountInputEvent);
    client.on(Events.InteractionCreate, FoodCountResponseEvent);
    // }

    // why do we need the appToken to be waited for?
    // what needs to be parsed?
    const {
        discordConfig: { appToken }
    } = await NmConfigService.getParsed();
    client.login(appToken);
}

// what is this information helpful for?
console.log(new Date());
console.log(process.env.NODE_ENV);
console.log(Config());

main();
