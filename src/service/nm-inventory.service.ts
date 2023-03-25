import { GoogleSpreadsheetsService } from './google-spreadsheets.service';
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
    return (
        (await GoogleSpreadsheetsService.rangeGet(
            `'${sheetName}'!A2:E`,
            GSPREAD_INVENTORY_ID
        )) || []
    );
}

export async function appendFoodCount(
    foodCount: FoodCountMapType,
    // the current year's sheet name by default
    sheet = getFoodCountSheetName()
): Promise<[string, number]> {
    // we create a new sheet every year, so we test if the sheet exists, and create it if not
    if (
        await GoogleSpreadsheetsService.sheetCreateIfNone(
            sheet,
            GSPREAD_INVENTORY_ID
        )
    ) {
        await GoogleSpreadsheetsService.rowsAppend(
            [GSPREAD_SHEET_INVENTORY_HEADERS],
            sheet,
            GSPREAD_INVENTORY_ID
        );
    }
    // rowsAppend returns an array tuple of range string, and index inserted
    return [
        await GoogleSpreadsheetsService.rowsAppend(
            [fromFoodCountMapToList(foodCount)],
            sheet,
            GSPREAD_INVENTORY_ID
        ),
        // the length minus 1 is this the zero index of the inserted count
        (
            await GoogleSpreadsheetsService.rangeGet(
                `'${sheet}'!A1:A`,
                GSPREAD_INVENTORY_ID
            )
        ).length - 1
    ];
}

export async function deleteFoodCountByIndex(
    startIndex: number,
    // todo: this is dangerous? we will delete the last row in tue current sheet by default
    sheetName: string = getFoodCountSheetName()
) {
    const sheetId = await GoogleSpreadsheetsService.getSheetIdByName(
        sheetName,
        GSPREAD_INVENTORY_ID
    );

    await GoogleSpreadsheetsService.rowsDelete(
        startIndex,
        startIndex + 1,
        sheetId,
        GSPREAD_INVENTORY_ID
    );
}

export async function deleteLastFoodCount(
    // todo: this is dangerous? we will delete the last row in tue current sheet by default
    sheetName: string = getFoodCountSheetName()
) {
    const range =
        (await GoogleSpreadsheetsService.rangeGet(
            `'${sheetName}'!A:E`,
            GSPREAD_INVENTORY_ID
        )) || [];
    const lastRowIndex = range.length;
    if (lastRowIndex < 2) {
        console.log('We cannot delete the header');
        return;
    }
    await GoogleSpreadsheetsService.rowsWrite(
        [['', '', '', '', '']],
        `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`,
        GSPREAD_INVENTORY_ID
    );
}
