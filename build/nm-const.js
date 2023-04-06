"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSPREAD_SHEET_INVENTORY_HEADERS = exports.GSPREAD_INVENTORY_SHEET_PREFIX = exports.GSPREAD_INVENTORY_ID = exports.GSPREAD_CORE_ACTIVE_STATE_LIST = exports.GSPREAD_CORE_ID = void 0;
/**
 * CORE DATA
 */
// todo: this is config, not const
// todo: we want an env config, so test and prod vars
// the  spreadsheet id for the core data model where people and orgs are kept
exports.GSPREAD_CORE_ID = '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek';
// across our data model, these strings are used to identify if a resource is active or not
exports.GSPREAD_CORE_ACTIVE_STATE_LIST = [
    'active',
    'inactive'
];
/**
 * FOOD COUNT
 */
// the  spreadsheet id for where food counts are kept
exports.GSPREAD_INVENTORY_ID = '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM';
// the prefix for food-count sheets within the inventory sheet - we make a new one every year
// sheet name will look like: "food-count 2023"
exports.GSPREAD_INVENTORY_SHEET_PREFIX = 'food-count';
// corresond to collumns in food count sheet
exports.GSPREAD_SHEET_INVENTORY_HEADERS = [
    'date',
    'org',
    'lbs',
    'reporter',
    'note'
];
