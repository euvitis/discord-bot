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
const events_1 = require("./events");
const discord_js_1 = require("discord.js");
const nm_service_1 = require("./nm-service");
const config_1 = require("./config");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent
            ]
        });
        // todo: do we want this on every connection?
        // const commands = await loadCommands();
        // client.on(Events.InteractionCreate, async (c) => {
        //     console.log(c);
        //     console.log(`Hi!`);
        // });
        client.once(discord_js_1.Events.ClientReady, (c) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        }));
        // todo: this will file on every message sent. we probably
        // want a big switchboard and fire different stuff depending on
        // parameters
        client.on(discord_js_1.Events.MessageCreate, events_1.FoodCountInputEvent);
        // todo: this will file on every interaction sent. we probably
        // want a big switchboard and fire different stuff depending on
        // parameters
        client.on(discord_js_1.Events.InteractionCreate, events_1.FoodCountResponseEvent);
        const { discordConfig: { appToken } } = yield nm_service_1.NmConfigService.getParsed();
        client.login(appToken);
    });
}
console.log(new Date());
console.log(process.env.NODE_ENV);
console.log((0, config_1.Config)());
main();
