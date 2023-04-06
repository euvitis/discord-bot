import { ActiveStateType } from './model/night-market.model';

/**
 * CORE DATA
 */

// across our data model, these strings are used to identify if a resource is active or not
export const GSPREAD_CORE_ACTIVE_STATE_LIST: ActiveStateType[] = [
    'active',
    'inactive'
];

/**
 * FOOD COUNT INVENTORY
 */

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
