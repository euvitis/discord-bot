import { ActiveStateType } from '../model/nm.model';
import { GSPREAD_CORE_ACTIVE_STATE_LIST, GSPREAD_CORE_ID } from '../nm-const';
import { rangeGet, rowsWrite } from './gspread.service';

export async function getPersonNameList() {
    return (
        rangeGet('person!B2:B', GSPREAD_CORE_ID)
            // get rid of blanks
            .then((a) => a?.filter((b: string[]) => b[0].trim()) || [])
    );
}

// toggle a person state to active
export async function setPersonActiveState(
    email: string,
    activeState: ActiveStateType
) {
    if (GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
        throw new Error('Must set active state');
    }
    // get all the person rows
    const personList = await rangeGet('person!A:C', GSPREAD_CORE_ID);

    // find a match to email
    // TODO: implement user id from discord?
    email = email.toLowerCase().trim();
    const rowIndex = personList?.findIndex(
        (a: string[]) => a[2].toLowerCase().trim() === email
    );
    if (typeof rowIndex === 'undefined') {
        throw new Error('person does not exists');
    }
    const range = 'person!A' + (rowIndex + 1);

    // update cell for active at row and column index (add method to GSpreadService)
    await rowsWrite([[activeState]], range, GSPREAD_CORE_ID);
    return range;
}
