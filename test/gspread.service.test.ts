import { describe, expect, test } from '@jest/globals';
import {
    sheetExists,
    sheetDestroy,
    sheetCreate,
    rowsAppend,
    rangeGet,
    rowsDelete,
    getSheetIdByName,
    Alphabet
} from '../src/service/gspread.service';

import {
    GSPREAD_INVENTORY_ID,
    GSPREAD_SHEET_INVENTORY_HEADERS
} from '../src/nm-const';

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
        // todo: move this to gspread test
        expect(Alphabet[0]).toBe('A');
        expect(Alphabet[25]).toBe('Z');
    });

    test('can we  CREATE and DESTOY and ADD ROWS and DELETE ROWS to a sheet', async () => {
        if (await sheetExists('abc-test', GSPREAD_INVENTORY_ID)) {
            const b = await sheetDestroy('abc-test', GSPREAD_INVENTORY_ID);
            expect(b).toBe(true);
        }
        const a = await sheetCreate('abc-test', GSPREAD_INVENTORY_ID);
        expect(a).toBe(true);
        await rowsAppend(
            [GSPREAD_SHEET_INVENTORY_HEADERS],
            'abc-test',
            GSPREAD_INVENTORY_ID
        );
        const c = await rangeGet('abc-test!A:B', GSPREAD_INVENTORY_ID);
        expect(c[0][0]).toBe(GSPREAD_SHEET_INVENTORY_HEADERS[0]);
        expect(c[0][1]).toBe(GSPREAD_SHEET_INVENTORY_HEADERS[1]);

        await rowsAppend([['hi', 'there']], 'abc-test', GSPREAD_INVENTORY_ID);

        console.log(c);
        const d = await rangeGet('abc-test!A:B', GSPREAD_INVENTORY_ID);
        console.log(d);
        await rowsDelete(
            1,
            2,
            await getSheetIdByName('abc-test', GSPREAD_INVENTORY_ID),
            GSPREAD_INVENTORY_ID
        );
        expect(d.length).toBe(c.length + 1);
        // if (a) {
        //     const c = await sheetDestroy('abc-test', GSPREAD_INVENTORY_ID);
        //     expect(c).toBe(true);
        // }
    });
});
