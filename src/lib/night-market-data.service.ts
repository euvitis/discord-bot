import {
    sheetExists,
    sheetCreate,
    rowsAppend,
    rowsWrite,
    rangeGet
} from './gspread.service';

const GSPREAD_ID_CORE = '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek';
const GSPREAD_ID_FOOD_COUNT = '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM';
const ACTIVE_STATE_LIST = ['inactive', 'active'];

interface FoodCount {
    org: string;
    date: string;
    item?: string;
    unit: string;
    quantity: string;
    coordinator?: string;
    captain?: string;
}

export async function appendFoodCount(counts: FoodCount[]) {
    // the current year's sheet name
    const sheet = `inventory ${new Date().getFullYear()}`;

    // we create a new sheet every year, so we test if the sheet exists, and create it if not
    if (!(await sheetExists(sheet, GSPREAD_ID_FOOD_COUNT))) {
        await sheetCreate(sheet, GSPREAD_ID_FOOD_COUNT);
    }

    const rows = counts.map((count) => [
        count.org,
        count.date,
        count.item ?? '',
        count.unit,
        count.quantity,
        count.coordinator ?? '',
        count.captain ?? ''
    ]);

    return rowsAppend(rows, sheet, GSPREAD_ID_FOOD_COUNT);
}

export async function getOrgNameList(): Promise<string[]> {
    return await rangeGet('org!A3:B', GSPREAD_ID_CORE).then(
        (table) =>
            table?.flatMap(([status, name]) => {
                if (status == 'active') {
                    return [name];
                } else {
                    return [];
                }
            }) ?? []
    );
}

export async function getPersonNameList() {
    return (
        rangeGet('Person!B2:B', GSPREAD_ID_CORE)
            // get rid of blanks
            .then((a) => a?.filter((b: string[]) => b[0].trim()) || [])
    );
}

// toggle a person state to active
export async function setPersonActiveState(email: string, activeState: string) {
    if (ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
        throw new Error('Must set active state');
    }
    // get all the person rows
    const personList = await rangeGet('person!A:C', GSPREAD_ID_CORE);

    // find a match to email
    // TODO: implement user id from discord?
    email = email.toLowerCase().trim();
    const rowIndex = personList?.findIndex(
        (a) => a[2].toLowerCase().trim() === email
    );
    if (typeof rowIndex === 'undefined') {
        throw new Error('person does not exists');
    }
    const range = 'person!A' + (rowIndex + 1);

    // update cell for active at row and column index (add method to GSpreadService)
    await rowsWrite([[activeState]], range, GSPREAD_ID_CORE);
    return range;
}

// toggle an org state to active
export async function setOrgActiveState(name: string, activeState: string) {
    if (!ACTIVE_STATE_LIST.indexOf(activeState)) {
        throw new Error('Must set active state');
    }

    // TODO:
    // get all the org rows
    // find a match to name
    // update cell for active at row and column index (add method to GSpreadService)
}
