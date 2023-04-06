import { describe, expect, test } from '@jest/globals';
import {
    GoogleSpreadsheetsService,
    Alphabet
} from '../src/service/google-spreadsheets.service';

import { GSPREAD_SHEET_INVENTORY_HEADERS } from '../src/nm-const';
import { Config } from '../src/config';

const { GSPREAD_INVENTORY_ID } = Config();

describe('gspread.service.ts', () => {
    // test('does a sheet exist', async () => {
    //     const a = await sheetExists('person', GSPREAD_CORE_ID);

    //     expect(a).toBe(true);
    // });

    // test('does a sheet NOT exist', async () => {
    //     const a = await sheetExists('person123', GSPREAD_CORE_ID);

    //     expect(a).toBe(false);
    // });

    test('make sure our alphabet function works', () => {
        expect(Alphabet[0]).toBe('A');
        expect(Alphabet[25]).toBe('Z');
    });

    test('make sure our alphabet index method works', () => {
        expect(GoogleSpreadsheetsService.columnIndexFromLetter('A')).toBe(0);
        expect(GoogleSpreadsheetsService.columnIndexFromLetter('Z')).toBe(25);
    });

    test('can we  CREATE and DESTOY and ADD ROWS and DELETE ROWS to a sheet', async () => {
        if (
            await GoogleSpreadsheetsService.sheetExists(
                'abc-test',
                GSPREAD_INVENTORY_ID
            )
        ) {
            const b = await GoogleSpreadsheetsService.sheetDestroy(
                'abc-test',
                GSPREAD_INVENTORY_ID
            );
            expect(b).toBe(true);
        }
        const a = await GoogleSpreadsheetsService.sheetCreate(
            'abc-test',
            GSPREAD_INVENTORY_ID
        );
        expect(a).toBe(true);
        await GoogleSpreadsheetsService.rowsAppend(
            [GSPREAD_SHEET_INVENTORY_HEADERS],
            'abc-test',
            GSPREAD_INVENTORY_ID
        );
        const c = await GoogleSpreadsheetsService.rangeGet(
            'abc-test!A:B',
            GSPREAD_INVENTORY_ID
        );
        expect(c[0][0]).toBe(GSPREAD_SHEET_INVENTORY_HEADERS[0]);
        expect(c[0][1]).toBe(GSPREAD_SHEET_INVENTORY_HEADERS[1]);

        await GoogleSpreadsheetsService.rowsAppend(
            [['hi', 'there']],
            'abc-test',
            GSPREAD_INVENTORY_ID
        );
        const d = await GoogleSpreadsheetsService.rangeGet(
            'abc-test!A:B',
            GSPREAD_INVENTORY_ID
        );
        await GoogleSpreadsheetsService.rowsDelete(
            1,
            2,
            await GoogleSpreadsheetsService.getSheetIdByName(
                'abc-test',
                GSPREAD_INVENTORY_ID
            ),
            GSPREAD_INVENTORY_ID
        );
        expect(d.length).toBe(c.length + 1);
        // if (a) {
        //     const c = await sheetDestroy('abc-test', GSPREAD_INVENTORY_ID);
        //     expect(c).toBe(true);
        // }
    });
});
