import { ActiveStateType } from '../model/night-market.model';
import { GSPREAD_CORE_ACTIVE_STATE_LIST, GSPREAD_CORE_ID } from '../nm-const';
import { rangeGet } from './gspread.service';

export async function getOrgNameList(
    {
        active = true
    }: {
        active?: boolean;
    } = {
        active: true
    }
): Promise<string[]> {
    const r = ((await rangeGet('org!A3:B', GSPREAD_CORE_ID)) || []) as [
        string,
        string
    ][];

    return (
        r
            .map(([status, name]: [string, string]) => {
                // if we have requested only active orgs
                if (active && status !== GSPREAD_CORE_ACTIVE_STATE_LIST[0]) {
                    return '';
                }
                // otherwise return just the name
                return name.trim();
            })
            // remove empties
            .filter((a) => a)
    );
}

// toggle an org state to active
export async function setOrgActiveState(
    _name: string,
    activeState: ActiveStateType
) {
    if (!GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState)) {
        throw new Error('Must set active state');
    }

    // TODO:
    // get all the org rows
    // find a match to name
    // update cell for active at row and column index (add method to GSpreadService)
}
