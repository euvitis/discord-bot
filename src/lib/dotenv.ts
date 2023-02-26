const { config } = require('dotenv');

if (process.env.NODE_ENV === 'dev') {
    config();
}

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? '';
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '';
