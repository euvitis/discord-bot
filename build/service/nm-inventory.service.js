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
exports.deleteLastFoodCount = exports.deleteFoodCountByIndex = exports.appendFoodCount = exports.getFoodCount = exports.fromFoodCountMapToList = exports.getFoodCountSheetName = void 0;
const google_spreadsheets_service_1 = require("./google-spreadsheets.service");
const nm_const_1 = require("../nm-const");
const config_1 = require("../config");
const { GSPREAD_INVENTORY_ID } = (0, config_1.Config)();
function getFoodCountSheetName(
// defaults to current year
year = new Date().getFullYear()) {
    return `${nm_const_1.GSPREAD_INVENTORY_SHEET_PREFIX} ${year}`;
}
exports.getFoodCountSheetName = getFoodCountSheetName;
function fromFoodCountMapToList({ date, org, lbs, reporter, note }) {
    return [date, org, lbs, reporter, note];
}
exports.fromFoodCountMapToList = fromFoodCountMapToList;
function getFoodCount(sheetName) {
    return __awaiter(this, void 0, void 0, function* () {
        return ((yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(`'${sheetName}'!A2:E`, GSPREAD_INVENTORY_ID)) || []);
    });
}
exports.getFoodCount = getFoodCount;
function appendFoodCount(foodCount, 
// the current year's sheet name by default
sheet = getFoodCountSheetName()) {
    return __awaiter(this, void 0, void 0, function* () {
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (yield google_spreadsheets_service_1.GoogleSpreadsheetsService.sheetCreateIfNone(sheet, GSPREAD_INVENTORY_ID)) {
            yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rowsAppend([nm_const_1.GSPREAD_SHEET_INVENTORY_HEADERS], sheet, GSPREAD_INVENTORY_ID);
        }
        // rowsAppend returns an array tuple of range string, and index inserted
        return [
            yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rowsAppend([fromFoodCountMapToList(foodCount)], sheet, GSPREAD_INVENTORY_ID),
            // the length minus 1 is this the zero index of the inserted count
            (yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(`'${sheet}'!A1:A`, GSPREAD_INVENTORY_ID)).length - 1
        ];
    });
}
exports.appendFoodCount = appendFoodCount;
function deleteFoodCountByIndex(startIndex, 
// todo: this is dangerous? we will delete the last row in tue current sheet by default
sheetName = getFoodCountSheetName()) {
    return __awaiter(this, void 0, void 0, function* () {
        const sheetId = yield google_spreadsheets_service_1.GoogleSpreadsheetsService.getSheetIdByName(sheetName, GSPREAD_INVENTORY_ID);
        yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rowsDelete(startIndex, startIndex + 1, sheetId, GSPREAD_INVENTORY_ID);
    });
}
exports.deleteFoodCountByIndex = deleteFoodCountByIndex;
function deleteLastFoodCount(
// todo: this is dangerous? we will delete the last row in tue current sheet by default
sheetName = getFoodCountSheetName()) {
    return __awaiter(this, void 0, void 0, function* () {
        const range = (yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(`'${sheetName}'!A:E`, GSPREAD_INVENTORY_ID)) || [];
        const lastRowIndex = range.length;
        if (lastRowIndex < 2) {
            console.log('We cannot delete the header');
            return;
        }
        yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rowsWrite([['', '', '', '', '']], `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`, GSPREAD_INVENTORY_ID);
    });
}
exports.deleteLastFoodCount = deleteLastFoodCount;
