import {
    sheetCreateIfNone,
    rowsAppend,
    rowsWrite,
    rangeGet
} from './gspread.service';
import {
    GSPREAD_INVENTORY_ID,
    GSPREAD_SHEET_INVENTORY_HEADERS,
    GSPREAD_INVENTORY_SHEET_PREFIX
} from '../nm-const';

type FoodCountList = [string, string, number, string, string];

interface FoodCountMapType {
    org: string;
    date: string;
    lbs: number;
    reporter: string;
    note: string;
}

export function getFoodCountSheetName(
    // defaults to current year
    year = new Date().getFullYear()
): string {
    return `${GSPREAD_INVENTORY_SHEET_PREFIX} ${year}`;
}

export function fromFoodCountMapToList({
    date,
    org,
    lbs,
    reporter,
    note
}: FoodCountMapType): FoodCountList {
    return [date, org, lbs, reporter, note];
}
export async function getFoodCount(sheetName: string) {
    return (await rangeGet(`'${sheetName}'!A2:E`, GSPREAD_INVENTORY_ID)) || [];
}

export async function appendFoodCount(
    foodCount: FoodCountMapType,
    // the current year's sheet name by default
    sheet = getFoodCountSheetName()
) {
    // we create a new sheet every year, so we test if the sheet exists, and create it if not
    if (await sheetCreateIfNone(sheet, GSPREAD_INVENTORY_ID)) {
        await rowsAppend(
            [GSPREAD_SHEET_INVENTORY_HEADERS],
            sheet,
            GSPREAD_INVENTORY_ID
        );
    }

    // rowsAppend returns an array of strings that are indices in the spreadsheet
    return rowsAppend(
        [fromFoodCountMapToList(foodCount)],
        sheet,
        GSPREAD_INVENTORY_ID
    );
}

export async function deleteLastFoodCount(
    // todo: this is dangerous? we will delete the last row in tue current sheet by default
    sheetName: string = getFoodCountSheetName()
) {
    const range =
        (await rangeGet(`'${sheetName}'!A:E`, GSPREAD_INVENTORY_ID)) || [];
    const lastRowIndex = range.length;
    if (lastRowIndex < 2) {
        console.log('We cannot delete the header');
        return;
    }
    await rowsWrite(
        [['', '', '', '', '']],
        `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`,
        GSPREAD_INVENTORY_ID
    );
}
