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
exports.NmConfigService = void 0;
const google_secrets_service_1 = require("./google-secrets.service");
const path_1 = require("path");
const fs_1 = require("fs");
const DISCORD_CONFIG_NAME = 'config-discord-api', GOOGLE_KEYS_NAME = 'config-google-api';
class NmConfigService {
    static getParsed() {
        return __awaiter(this, void 0, void 0, function* () {
            let googleSpreadsheetsKeys, discordConfig;
            if (process.env.NODE_ENV === 'prod') {
                googleSpreadsheetsKeys =
                    yield google_secrets_service_1.GoogleSecretService.getParsed(`nm-${GOOGLE_KEYS_NAME}`);
                discordConfig =
                    yield google_secrets_service_1.GoogleSecretService.getParsed(`nm-${DISCORD_CONFIG_NAME}`);
            }
            else {
                googleSpreadsheetsKeys = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${GOOGLE_KEYS_NAME}.keys.json`), 'utf-8'));
                discordConfig = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../../${DISCORD_CONFIG_NAME}.keys.json`), 'utf-8'));
            }
            return {
                googleSpreadsheetsKeys,
                discordConfig
            };
        });
    }
}
exports.NmConfigService = NmConfigService;
