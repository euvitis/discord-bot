module.exports = {
    getValues
} 
async function getValues(range,spreadsheetId="17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek" ) {
    const { GoogleAuth } = require('google-auth-library');
    const { google } = require('googleapis');

    const auth = new GoogleAuth({
        keyFile: "keys.json",
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const service = google.sheets({ version: 'v4', auth });
    try {
        const result = await service.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const numRows = result.data.values ? result.data.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
        return result.data.values;
    } catch (err) {
        // TODO (developer) - Handle exception
        throw err;
    }
}
