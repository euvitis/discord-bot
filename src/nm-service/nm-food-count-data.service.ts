import { GoogleSpreadsheetsService } from '../service';

import { Config } from '../config';

import { ActiveStateType } from '../model/night-market.model';

/**
 * CORE DATA
 */

// across our data model, these strings are used to identify if a resource is active or not
export const GSPREAD_CORE_ACTIVE_STATE_LIST: ActiveStateType[] = [
    'active',
    'inactive'
];

/**
 *  FOODCOUNT
 */

// the prefix for food-count sheets within spreadsheet - we make a new one every year
// sheet name will look like: "food-count 2023"
export const GSPREAD_FOODCOUNT_SHEET_PREFIX = 'food-count';

// corresond to collumns in food count sheet
export const GSPREAD_SHEET_FOODCOUNT_HEADERS = [
    'date',
    'org',
    'lbs',
    'reporter',
    'note'
];

const { GSPREAD_FOODCOUNT_ID } = Config();

type FoodCountList = [string, string, number, string, string];

interface FoodCountMapType {
    org: string;
    date: string;
    lbs: number;
    reporter: string;
    note: string;
}

export class NmFoodCountDataService {
    static getFoodCountSheetName(
        // defaults to current year
        year = new Date().getFullYear()
    ): string {
        return `${GSPREAD_FOODCOUNT_SHEET_PREFIX} ${year}`;
    }

    static fromFoodCountMapToList({
        date,
        org,
        lbs,
        reporter,
        note
    }: FoodCountMapType): FoodCountList {
        return [date, org, lbs, reporter, note];
    }
    static async getFoodCount(sheetName: string) {
        return (
            (await GoogleSpreadsheetsService.rangeGet(
                `'${sheetName}'!A2:E`,
                GSPREAD_FOODCOUNT_ID
            )) || []
        );
    }

    static async appendFoodCount(
        foodCount: FoodCountMapType,
        // the current year's sheet name by default
        sheet = this.getFoodCountSheetName()
    ): Promise<[string, number]> {
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (
            await GoogleSpreadsheetsService.sheetCreateIfNone(
                sheet,
                GSPREAD_FOODCOUNT_ID
            )
        ) {
            await GoogleSpreadsheetsService.rowsAppend(
                [GSPREAD_SHEET_FOODCOUNT_HEADERS],
                sheet,
                GSPREAD_FOODCOUNT_ID
            );
        }
        // rowsAppend returns an array tuple of range string, and index inserted
        return [
            await GoogleSpreadsheetsService.rowsAppend(
                [this.fromFoodCountMapToList(foodCount)],
                sheet,
                GSPREAD_FOODCOUNT_ID
            ),
            // the length minus 1 is this the zero index of the inserted count
            (
                await GoogleSpreadsheetsService.rangeGet(
                    `'${sheet}'!A1:A`,
                    GSPREAD_FOODCOUNT_ID
                )
            ).length - 1
        ];
    }

    static async deleteFoodCountByIndex(
        startIndex: number,
        // todo: this is dangerous? we will delete the last row in tue current sheet by default
        sheetName: string = this.getFoodCountSheetName()
    ) {
        const sheetId = await GoogleSpreadsheetsService.getSheetIdByName(
            sheetName,
            GSPREAD_FOODCOUNT_ID
        );

        await GoogleSpreadsheetsService.rowsDelete(
            startIndex,
            startIndex + 1,
            sheetId,
            GSPREAD_FOODCOUNT_ID
        );
    }

    static async deleteLastFoodCount(
        // todo: this is dangerous? we will delete the last row in tue current sheet by default
        sheetName: string = this.getFoodCountSheetName()
    ) {
        const range =
            (await GoogleSpreadsheetsService.rangeGet(
                `'${sheetName}'!A:E`,
                GSPREAD_FOODCOUNT_ID
            )) || [];
        const lastRowIndex = range.length;
        if (lastRowIndex < 2) {
            console.log('We cannot delete the header');
            return;
        }
        await GoogleSpreadsheetsService.rowsWrite(
            [['', '', '', '', '']],
            `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`,
            GSPREAD_FOODCOUNT_ID
        );
    }
}
