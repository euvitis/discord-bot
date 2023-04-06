import { ActiveStateType } from './model/night-market.model';

/**
 * CORE DATA
 */
// todo: this is config, not const
// todo: we want an env config, so test and prod vars
// the  spreadsheet id for the core data model where people and orgs are kept
export const GSPREAD_CORE_ID = '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek';

// across our data model, these strings are used to identify if a resource is active or not
export const GSPREAD_CORE_ACTIVE_STATE_LIST: ActiveStateType[] = [
    'active',
    'inactive'
];

/**
 * FOOD COUNT
 */

// // the  spreadsheet id for where food counts are kept
// export const GSPREAD_INVENTORY_ID =
//    '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM';
// the prefix for food-count sheets within the inventory sheet - we make a new one every year
// sheet name will look like: "food-count 2023"
export const GSPREAD_INVENTORY_SHEET_PREFIX = 'food-count';

// corresond to collumns in food count sheet
export const GSPREAD_SHEET_INVENTORY_HEADERS = [
    'date',
    'org',
    'lbs',
    'reporter',
    'note'
];
