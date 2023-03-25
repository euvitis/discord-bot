import { GoogleSecretService } from './google-secrets.service';
import { join } from 'path';
import { readFileSync } from 'fs';

interface GoogleSpreadsheetsKeysModel {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}

interface DiscordConfigModel {
    appId: string;
    appToken: string;
}

export interface NmConfigModel {
    googleSpreadsheetsKeys: GoogleSpreadsheetsKeysModel;
    discordConfig: DiscordConfigModel;
}

const DISCORD_CONFIG_NAME = 'config-discord-api',
    GOOGLE_KEYS_NAME = 'config-google-api';

export class NmConfigService {
    static async getParsed(): Promise<NmConfigModel> {
        let googleSpreadsheetsKeys: GoogleSpreadsheetsKeysModel,
            discordConfig: DiscordConfigModel;

        if (process.env.NODE_ENV === 'prod') {
            googleSpreadsheetsKeys =
                await GoogleSecretService.getParsed<GoogleSpreadsheetsKeysModel>(
                    `nm-${GOOGLE_KEYS_NAME}`
                );
            discordConfig =
                await GoogleSecretService.getParsed<DiscordConfigModel>(
                    `nm-${DISCORD_CONFIG_NAME}`
                );
        } else {
            googleSpreadsheetsKeys = JSON.parse(
                readFileSync(
                    join(__dirname, `../../${GOOGLE_KEYS_NAME}.keys.json`),
                    'utf-8'
                )
            );
            discordConfig = JSON.parse(
                readFileSync(
                    join(__dirname, `../../${DISCORD_CONFIG_NAME}.keys.json`),
                    'utf-8'
                )
            );
        }

        return {
            googleSpreadsheetsKeys,
            discordConfig
        };
    }
}
