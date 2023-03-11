import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const auth = new GoogleAuth({
    keyFile: 'keys.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

const gspread = google.sheets({ version: 'v4', auth });

export async function rangeGet(range: string, spreadsheetId: string) {
    validate(range, spreadsheetId);

    const result = await gspread.spreadsheets.values.get({
        spreadsheetId,
        range
    });

    return result.data.values || [];
}

export async function rowsWrite(
    values: string[][],
    range: string,
    spreadsheetId: string
) {
    if (!values || !(values instanceof Array) || !values.length) {
        throw new Error('Must pass a valid values');
    }

    validate(range, spreadsheetId);

    const service = google.sheets({ version: 'v4', auth });

    const resource = {
        values
    };
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
export async function rowsAppend(
    values: (string | number)[][],
    range: string,
    spreadsheetId: string
): Promise<string> {
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
                r(response.data.updates.updatedRange);
            }
        );
    });
}

export async function sheetExists(
    title: string,
    spreadsheetId: string
): Promise<boolean> {
    try {
        const id = await getSheetIdByName(title, spreadsheetId);
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

export async function getSheetIdByName(
    title: string,
    spreadsheetId: string
): Promise<number | void> {
    try {
        const request = {
            spreadsheetId,
            ranges: [title],
            includeGridData: false
        };

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

export async function sheetCreateIfNone(
    title: string,
    spreadsheetId: string
): Promise<boolean> {
    // we create a new sheet every year, so we test if the sheet exists, and create it if not
    if (!(await sheetExists(title, spreadsheetId))) {
        await sheetCreate(title, spreadsheetId);

        return true;
    }
    return false;
}

export async function sheetCreate(title: string, spreadsheetId: string) {
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

        await gspread.spreadsheets.batchUpdate(request);
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}

export async function sheetDestroy(title: string, spreadsheetId: string) {
    validate(title, spreadsheetId);

    try {
        const sheetId = await getSheetIdByName(title, spreadsheetId);
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
// abstract out test for range and spreadsheetId
function validate(range: string, spreadsheetId: string) {
    if (!range) {
        throw new Error('Must pass a valid sheet "range"');
    }

    if (!spreadsheetId) {
        throw new Error('Must pass a valid spreadsheet id');
    }
}
