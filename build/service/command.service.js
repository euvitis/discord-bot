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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishCommands = exports.loadCommands = void 0;
const discord_js_1 = require("discord.js");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = require("../dotenv");
function loadCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        const commands = new discord_js_1.Collection();
        const dir = node_path_1.default.join(__dirname, '../commands');
        for (const file of node_fs_1.default
            .readdirSync(dir)
            .filter((file) => file.endsWith('.js'))) {
            const command = require(node_path_1.default.join(dir, file));
            if ('get_data' in command && 'execute' in command) {
                const data = yield command.get_data();
                commands.set(data.name, Object.assign({ data }, command));
            }
            else {
                console.log(`WRN The command at ${file} is missing a required "get_data" or "execute" property.`);
            }
        }
        return commands;
    });
}
exports.loadCommands = loadCommands;
function publishCommands(commands) {
    return __awaiter(this, void 0, void 0, function* () {
        const rest = new discord_js_1.REST({ version: '10' }).setToken(dotenv_1.DISCORD_TOKEN);
        yield rest.put(discord_js_1.Routes.applicationCommands(dotenv_1.DISCORD_CLIENT_ID), {
            body: [...commands.values()].map(({ data }) => data.toJSON())
        });
        console.log(`Successfully reloaded (/) commands.`);
    });
}
exports.publishCommands = publishCommands;
