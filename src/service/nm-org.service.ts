import { ActiveStateType } from '../model/night-market.model';
import { GSPREAD_CORE_ACTIVE_STATE_LIST } from '../nm-const';
import { GoogleSpreadsheetsService } from './google-spreadsheets.service';

import { Config } from '../config';

const { GSPREAD_CORE_ID } = Config();
interface NmOrgModel {
    name: string;
    nameAltList: string[];
}
// one hour: every hour the org list gets refreshed
const ORG_LIST_CACHE_EXPIRY = 1000 * 60 * 60;
let ORG_LIST_CACHE_TIME = Date.now(),
    OrgCacheList: NmOrgModel[] = [];

// TODO: make this a class service

export async function getOrgList(
    {
        active = false,
        flushCache = true
    }: {
        active?: boolean;
        flushCache?: boolean;
    } = {
        active: false,
        flushCache: true
    }
): Promise<NmOrgModel[]> {
    if (
        // we have a list of orgs AND
        OrgCacheList.length &&
        // we are not flushing the cache AND
        !flushCache &&
        // the cache is not expired
        Date.now() - ORG_LIST_CACHE_TIME < ORG_LIST_CACHE_EXPIRY
    ) {
        return OrgCacheList;
    }
    const r = ((await GoogleSpreadsheetsService.rangeGet(
        'org!A3:C',
        GSPREAD_CORE_ID
    )) || []) as [string, string, string][];
    OrgCacheList = r
        .filter(([status, name]) => {
            if (active && status !== GSPREAD_CORE_ACTIVE_STATE_LIST[0]) {
                return false;
            }
            // filter any blank names as well
            return !!name.trim();
        })
        .map(([_, name, nameAltList]) => {
            // if we have requested only active orgs

            // otherwise return just the name
            return {
                name: name.trim(),
                nameAltList:
                    // spreadsheet service does not return a value if there is nothing defined
                    nameAltList
                        ?.split(',')
                        .filter((a) => a.trim())
                        .map((a) => a.trim()) || []
            };
        });

    return OrgCacheList;
}

export async function getOrgNameList(
    opts: {
        active?: boolean;
        flushCache?: boolean;
    } = {
        active: false,
        flushCache: true
    }
): Promise<string[]> {
    const r = await getOrgList(opts);
    return r.map((a) => a.name);
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
