"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCORD_CLIENT_ID = exports.DISCORD_TOKEN = void 0;
const { config } = require('dotenv');
config();
exports.DISCORD_TOKEN = (_a = process.env.DISCORD_TOKEN) !== null && _a !== void 0 ? _a : '';
exports.DISCORD_CLIENT_ID = (_b = process.env.DISCORD_CLIENT_ID) !== null && _b !== void 0 ? _b : '';
