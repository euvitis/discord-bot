import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const auth = new GoogleAuth({
  keyFile: 'keys.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

const gspread = google.sheets({ version: 'v4', auth });

export const GSpreadService = {
  rangeGet: async (range: string, spreadsheetId: string) => {
    validate(range, spreadsheetId);

    const result = await gspread.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const numRows = result.data.values ? result.data.values.length : 0;
    console.log(`${numRows} rows retrieved.`);
    return result.data.values;
  },

  rowsAppend: async (
    values: string[][],
    range: string,
    spreadsheetId: string
  ) => {
    if (!values || !(values instanceof Array) || !values.length) {
      throw new Error('Must pass a valid values');
    }
    validate(range, spreadsheetId);

    return new Promise((r, x) => {
      gspread.spreadsheets.values.append(
        {
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values }
        },
        function (err: Error | null, response: any) {
          if (err) {
            x(err);
          }
          r(response);
        }
      );
    });
  },
  sheetExists: async (title: string, spreadsheetId: string) => {
    try {
      const request = {
        spreadsheetId,
        ranges: [title],
        includeGridData: false
      };

      const res = await gspread.spreadsheets.get(request);
      return (
        (res.data.sheets?.length && res.data.sheets[0]?.properties?.sheetId) ||
        null
      );
    } catch (e) {
      return null;
    }
  },
  sheetCreate: async (title: string, spreadsheetId: string) => {
    validate(title, spreadsheetId);
    try {
      const request = {
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title
                }
              }
            }
          ]
        },
        auth
      };

      const resp = await gspread.spreadsheets.batchUpdate(request);
    } catch (error) {
      console.log(error);
    }
  }
};

// abstract out test for range and spreadsheetId
function validate(range: string, spreadsheetId: string) {
  if (!range) {
    throw new Error('Must pass a valid sheet "range"');
  }

  if (!spreadsheetId) {
    throw new Error('Must pass a valid spreadsheet id');
  }
}
