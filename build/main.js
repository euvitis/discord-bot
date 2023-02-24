"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/dotenv");
const night_market_data_service_1 = require("./lib/night-market-data.service");
const discord_js_1 = require("discord.js");
//const { getValues } = require('./lib/night-market-data.service')
// cdc: commented because we use env variables to pass token
//const { token } = require('./config.json');
const token = process.env.DISCORD_TOKEN;
console.log(token);
// Create a new client instance
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent
    ]
});
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(discord_js_1.Events.ClientReady, (c) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    //   let channel = c.channels.cache.find(
    //     (channel) => channel.name === 'bot-commands'
    //   );
    // let thread = await channel.threads.create({
    //     name: "friday 1.13 pickups",
    // })
}));
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (message.channel.id === 'bot-commands') {
        console.log('hi');
    }
}));
const orgsListP = night_market_data_service_1.NightMarketDataService.getOrgNameList().then((a) => a.map((a) => ({
    label: a[0],
    description: 'This is ' + a[0],
    value: a[0].replace(' ', '_').toLowerCase()
})));
client.on('messageCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(interaction.content);
    //if (!interaction.isChatInputCommand()) return;
    const orgList = yield orgsListP;
    console.log(orgList.slice(0, 10));
    if (interaction.content === 'org') {
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions(...orgList.slice(0, 10)));
        yield interaction.reply({ content: 'Pong!', components: [row] });
    }
}));
// Log in to Discord with your client's token
client.login(token);
