import { GoogleAuth } from 'google-auth-library';
import { google, sheets_v4 } from 'googleapis';
import { NmConfigService } from '../nm-service';

// the alphabet indexed in array
export const AlphaIndex = Array.from(Array(26)).map((e, i) => i + 65);
// the alphabet in an array
export const Alphabet = AlphaIndex.map((x) =>
    String.fromCharCode(x).toUpperCase()
);

const Gspread = NmConfigService.getParsed().then((config) => {
    const credentials = config.googleSpreadsheetsKeys;
    const auth = new GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });

    return [google.sheets({ version: 'v4', auth }), auth] as [
        sheets_v4.Sheets,
        GoogleAuth
    ];
});

export class GoogleSpreadsheetsService {
    static columnIndexFromLetter(a: string): number {
        const n = Alphabet.indexOf(a.toUpperCase());
        if (n < 0) {
            throw new Error('that letter does not exists');
        }
        return n;
    }
    static async rangeGet<A extends string[][] = string[][]>(
        range: string,
        spreadsheetId: string
    ): Promise<A> {
        validate(range, spreadsheetId);
        const [gspread] = await Gspread;
        const result = await gspread.spreadsheets.values.get({
            spreadsheetId,
            range
        });

        return (result.data.values || []) as A;
    }

    static async rowsDelete(
        startIndex: number,
        endIndex: number,
        sheetId: number,
        spreadsheetId: string
    ) {
        const requestBody = {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex,
                            endIndex
                        }
                    }
                }
            ]
        };
        const [gspread] = await Gspread;

        try {
            await gspread.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody
            });
        } catch (err) {
            // TODO (Developer) - Handle exception
            throw err;
        }
    }

    static async rowsWrite(
        values: string[][],
        range: string,
        spreadsheetId: string
    ) {
        if (!values || !(values instanceof Array) || !values.length) {
            throw new Error('Must pass a valid values');
        }

        validate(range, spreadsheetId);
        const [gspread] = await Gspread;
        try {
            const result = await gspread.spreadsheets.values.update({
                spreadsheetId,
                valueInputOption: 'RAW',
                range,
                requestBody: { values }
            });

            console.log('%d cells updated.', result.data.updatedCells);
            return result.data.updatedRange;
        } catch (err) {
            // TODO (Developer) - Handle exception
            throw err;
        }
    }

    /**
     *
     * @param values string values to insert in sheet
     * @param range where in the sheet to insert
     * @param spreadsheetId which spreadsheet to insert
     * @returns range that was affected
     */
    static async rowsAppend(
        values: (string | number)[][],
        range: string,
        spreadsheetId: string
    ): Promise<string> {
        if (!values || !(values instanceof Array) || !values.length) {
            throw new Error('Must pass a valid values');
        }
        validate(range, spreadsheetId);
        const [gspread] = await Gspread;
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
                    r(response.data.updates.updatedRange);
                }
            );
        });
    }

    static async sheetExists(
        title: string,
        spreadsheetId: string
    ): Promise<boolean> {
        try {
            const id = await this.getSheetIdByName(title, spreadsheetId);
            const request = {
                spreadsheetId,
                ranges: [title],
                includeGridData: false
            };
            // if we get a positive number the sheet exists
            return id >= 0;
        } catch (e) {
            // if we get an error the sheet does not exist
            return false;
        }
    }

    static async getSheetIdByName(
        title: string,
        spreadsheetId: string
    ): Promise<number> {
        try {
            const request = {
                spreadsheetId,
                ranges: [title],
                includeGridData: false
            };
            const [gspread] = await Gspread;
            const res = await gspread.spreadsheets.get(request);
            if (
                !res?.data?.sheets?.length ||
                (!res?.data?.sheets[0]?.properties?.sheetId &&
                    !(res?.data?.sheets[0]?.properties?.sheetId || 0 >= 0))
            ) {
                throw new Error(
                    `Sheet ${title} does not exist in spreadsheet ${spreadsheetId}`
                );
            }

            return res?.data?.sheets[0]?.properties?.sheetId || 0;
        } catch (e) {
            throw e;
        }
    }

    static async sheetCreateIfNone(
        title: string,
        spreadsheetId: string
    ): Promise<boolean> {
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (!(await this.sheetExists(title, spreadsheetId))) {
            await this.sheetCreate(title, spreadsheetId);

            return true;
        }
        return false;
    }

    static async sheetCreate(title: string, spreadsheetId: string) {
        validate(title, spreadsheetId);
        const [gspread, auth] = await Gspread;
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
            await gspread.spreadsheets.batchUpdate(request);
            return true;
        } catch (error) {
            console.error(error);
        }
        return false;
    }

    static async sheetDestroy(title: string, spreadsheetId: string) {
        validate(title, spreadsheetId);
        const [gspread, auth] = await Gspread;
        try {
            const sheetId = await this.getSheetIdByName(title, spreadsheetId);
            const request = {
                spreadsheetId,
                resource: {
                    requests: [
                        {
                            deleteSheet: {
                                sheetId
                            }
                        }
                    ]
                },
                auth
            };

            await gspread.spreadsheets.batchUpdate(request);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

// abstract out test for range and spreadsheetId
function validate(range: string, spreadsheetId: string) {
    if (!range) {
        throw new Error('Must pass a valid sheet "range"');
    }

    if (!spreadsheetId) {
        throw new Error('Must pass a valid spreadsheet id');
    }
}
