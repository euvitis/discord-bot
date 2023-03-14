import { describe, expect, test, jest } from '@jest/globals';
import {
    appendFoodCount,
    deleteLastFoodCount,
    getFoodCount,
    getFoodCountSheetName
} from '../src/service/nm-inventory.service';
import { getOrgNameList } from '../src/service/nm-org.service';
import { PersonService } from '../src/service/nm-person.service';
import {
    rangeGet,
    sheetCreateIfNone,
    rowsAppend,
    sheetDestroy
} from '../src/service/gspread.service';

import {
    GSPREAD_INVENTORY_ID,
    GSPREAD_SHEET_INVENTORY_HEADERS
} from '../src/nm-const';

jest.setTimeout(20000);

describe('NightMarketDataService', () => {
    test('update a person active status in central spreadsheet', async () => {
        const a = await PersonService.setActiveState(
            'christianco@gmail.com',
            'active'
        );

        expect(a).toBe('person!A35');
    });

    test('gets the list of orgs from central spreadsheet', async () => {
        const orgList = await getOrgNameList({});
        expect(orgList.length).toBeGreaterThan(0);
    });

    test('appends to the food count and deletes it', async () => {
        const sheetName = getFoodCountSheetName(1877);
        expect(sheetName).toBe('food-count 1877');

        await sheetCreateIfNone(sheetName, GSPREAD_INVENTORY_ID);
        await rowsAppend(
            [GSPREAD_SHEET_INVENTORY_HEADERS],
            sheetName,
            GSPREAD_INVENTORY_ID
        );

        const foodCountBefore = await getFoodCount(sheetName);
        const foodRecordOne = {
            date: '01/19/1996',
            org: 'Sutter General',
            lbs: 8,
            note: 'baby food',
            reporter: 'christianco@gmail.com'
        };

        // appends to current year
        const a = await appendFoodCount(foodRecordOne, sheetName);

        expect(a[1]).toBeGreaterThan(0);

        const b = await rangeGet(a[0], GSPREAD_INVENTORY_ID);

        const foodCountAfter = await getFoodCount(sheetName);

        expect(foodCountAfter.length).toBe(foodCountBefore.length + 1);

        expect(b[0][0]).toBe(foodRecordOne.date);
        expect(b[0][1]).toBe(foodRecordOne.org);
        expect(+b[0][2]).toBe(foodRecordOne.lbs);
        expect(b[0][3]).toBe(foodRecordOne.reporter);
        expect(b[0][4]).toBe(foodRecordOne.note);

        expect(foodCountAfter[foodCountAfter.length - 1][0]).toBe(
            foodRecordOne.date
        );
        expect(foodCountAfter[foodCountAfter.length - 1][1]).toBe(
            foodRecordOne.org
        );
        expect(+foodCountAfter[foodCountAfter.length - 1][2]).toBe(
            foodRecordOne.lbs
        );
        expect(foodCountAfter[foodCountAfter.length - 1][3]).toBe(
            foodRecordOne.reporter
        );
        expect(foodCountAfter[foodCountAfter.length - 1][4]).toBe(
            foodRecordOne.note
        );

        const foodRecordTwo = {
            date: '01/19/1999',
            org: 'Food Co-op',
            lbs: 1,
            note: 'fresh umbilical cord',
            reporter: 'christian@night-market.org'
        };

        await appendFoodCount(foodRecordTwo, sheetName);

        await deleteLastFoodCount(sheetName);

        const foodCountFinal = await getFoodCount(sheetName);
        expect(foodCountFinal[foodCountFinal.length - 1][0]).toBe(
            foodRecordOne.date
        );
        expect(foodCountFinal[foodCountFinal.length - 1][1]).toBe(
            foodRecordOne.org
        );
        expect(+foodCountFinal[foodCountFinal.length - 1][2]).toBe(
            foodRecordOne.lbs
        );
        expect(foodCountFinal[foodCountFinal.length - 1][3]).toBe(
            foodRecordOne.reporter
        );
        expect(foodCountFinal[foodCountFinal.length - 1][4]).toBe(
            foodRecordOne.note
        );
        await sheetDestroy(sheetName, GSPREAD_INVENTORY_ID);
    });
});
