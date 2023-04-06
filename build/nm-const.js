"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSPREAD_SHEET_INVENTORY_HEADERS = exports.GSPREAD_INVENTORY_SHEET_PREFIX = exports.GSPREAD_CORE_ACTIVE_STATE_LIST = void 0;
/**
 * CORE DATA
 */
// across our data model, these strings are used to identify if a resource is active or not
exports.GSPREAD_CORE_ACTIVE_STATE_LIST = [
    'active',
    'inactive'
];
/**
 * FOOD COUNT INVENTORY
 */
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
