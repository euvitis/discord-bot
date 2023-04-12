"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmFoodCountDataService = exports.GSPREAD_SHEET_FOODCOUNT_HEADERS = exports.GSPREAD_FOODCOUNT_SHEET_PREFIX = exports.GSPREAD_CORE_ACTIVE_STATE_LIST = void 0;
const service_1 = require("../service");
const config_1 = require("../config");
/**
 * CORE DATA
 */
// across our data model, these strings are used to identify if a resource is active or not
exports.GSPREAD_CORE_ACTIVE_STATE_LIST = [
    'active',
    'inactive'
];
/**
 *  FOODCOUNT
 */
// the prefix for food-count sheets within spreadsheet - we make a new one every year
// sheet name will look like: "food-count 2023"
exports.GSPREAD_FOODCOUNT_SHEET_PREFIX = 'food-count';
// corresond to collumns in food count sheet
exports.GSPREAD_SHEET_FOODCOUNT_HEADERS = [
    'date',
    'org',
    'lbs',
    'reporter',
    'note'
];
const { GSPREAD_FOODCOUNT_ID } = (0, config_1.Config)();
class NmFoodCountDataService {
    static getFoodCountSheetName(
    // defaults to current year
    year = new Date().getFullYear()) {
        return `${exports.GSPREAD_FOODCOUNT_SHEET_PREFIX} ${year}`;
    }
    static fromFoodCountMapToList({ date, org, lbs, reporter, note }) {
        return [date, org, lbs, reporter, note];
    }
    static getFoodCount(sheetName) {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield service_1.GoogleSpreadsheetsService.rangeGet(`'${sheetName}'!A2:E`, GSPREAD_FOODCOUNT_ID)) || []);
        });
    }
    static appendFoodCount(foodCount, 
    // the current year's sheet name by default
    sheet = this.getFoodCountSheetName()) {
        return __awaiter(this, void 0, void 0, function* () {
            // we create a new sheet every year, so we test if the sheet exists, and create it if not
            if (yield service_1.GoogleSpreadsheetsService.sheetCreateIfNone(sheet, GSPREAD_FOODCOUNT_ID)) {
                yield service_1.GoogleSpreadsheetsService.rowsAppend([exports.GSPREAD_SHEET_FOODCOUNT_HEADERS], sheet, GSPREAD_FOODCOUNT_ID);
            }
            // rowsAppend returns an array tuple of range string, and index inserted
            return [
                yield service_1.GoogleSpreadsheetsService.rowsAppend([this.fromFoodCountMapToList(foodCount)], sheet, GSPREAD_FOODCOUNT_ID),
                // the length minus 1 is this the zero index of the inserted count
                (yield service_1.GoogleSpreadsheetsService.rangeGet(`'${sheet}'!A1:A`, GSPREAD_FOODCOUNT_ID)).length - 1
            ];
        });
    }
    static deleteFoodCountByIndex(startIndex, 
    // todo: this is dangerous? we will delete the last row in tue current sheet by default
    sheetName = this.getFoodCountSheetName()) {
        return __awaiter(this, void 0, void 0, function* () {
            const sheetId = yield service_1.GoogleSpreadsheetsService.getSheetIdByName(sheetName, GSPREAD_FOODCOUNT_ID);
            yield service_1.GoogleSpreadsheetsService.rowsDelete(startIndex, startIndex + 1, sheetId, GSPREAD_FOODCOUNT_ID);
        });
    }
    static deleteLastFoodCount(
    // todo: this is dangerous? we will delete the last row in tue current sheet by default
    sheetName = this.getFoodCountSheetName()) {
        return __awaiter(this, void 0, void 0, function* () {
            const range = (yield service_1.GoogleSpreadsheetsService.rangeGet(`'${sheetName}'!A:E`, GSPREAD_FOODCOUNT_ID)) || [];
            const lastRowIndex = range.length;
            if (lastRowIndex < 2) {
                console.log('We cannot delete the header');
                return;
            }
            yield service_1.GoogleSpreadsheetsService.rowsWrite([['', '', '', '', '']], `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`, GSPREAD_FOODCOUNT_ID);
        });
    }
}
exports.NmFoodCountDataService = NmFoodCountDataService;
