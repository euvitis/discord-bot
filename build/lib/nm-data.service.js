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
exports.setOrgActiveState = exports.setPersonActiveState = exports.getPersonNameList = exports.getOrgNameList = exports.deleteLastFoodCount = exports.appendFoodCount = exports.getFoodCount = exports.fromFoodCountMapToList = exports.getFoodCountSheetName = void 0;
const gspread_service_1 = require("./gspread.service");
const nm_const_1 = require("../nm-const");
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
        return (yield (0, gspread_service_1.rangeGet)(`'${sheetName}'!A2:E`, nm_const_1.GSPREAD_INVENTORY_ID)) || [];
    });
}
exports.getFoodCount = getFoodCount;
function appendFoodCount(foodCount, 
// the current year's sheet name by default
sheet = getFoodCountSheetName()) {
    return __awaiter(this, void 0, void 0, function* () {
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (yield (0, gspread_service_1.sheetCreateIfNone)(sheet, nm_const_1.GSPREAD_INVENTORY_ID)) {
            yield (0, gspread_service_1.rowsAppend)([nm_const_1.GSPREAD_SHEET_INVENTORY_HEADERS], sheet, nm_const_1.GSPREAD_INVENTORY_ID);
        }
        // rowsAppend returns an array of strings that are indices in the spreadsheet
        return (0, gspread_service_1.rowsAppend)([fromFoodCountMapToList(foodCount)], sheet, nm_const_1.GSPREAD_INVENTORY_ID);
    });
}
exports.appendFoodCount = appendFoodCount;
function deleteLastFoodCount(sheetName) {
    return __awaiter(this, void 0, void 0, function* () {
        const range = (yield (0, gspread_service_1.rangeGet)(`'${sheetName}'!A:E`, nm_const_1.GSPREAD_INVENTORY_ID)) || [];
        const lastRowIndex = range.length;
        if (lastRowIndex < 2) {
            console.log('We cannot delete the header');
            return;
        }
        yield (0, gspread_service_1.rowsWrite)([['', '', '', '', '']], `'${sheetName}'!A${lastRowIndex}:E${lastRowIndex}`, nm_const_1.GSPREAD_INVENTORY_ID);
    });
}
exports.deleteLastFoodCount = deleteLastFoodCount;
function getOrgNameList({ active = true } = {
    active: true
}) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = ((yield (0, gspread_service_1.rangeGet)('org!A3:B', nm_const_1.GSPREAD_CORE_ID)) || []);
        return (r
            .map(([status, name]) => {
            // if we have requested only active orgs
            if (active && status !== nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST[0]) {
                return '';
            }
            // otherwise return just the name
            return name.trim();
        })
            // remove empties
            .filter((a) => a));
    });
}
exports.getOrgNameList = getOrgNameList;
function getPersonNameList() {
    return __awaiter(this, void 0, void 0, function* () {
        return ((0, gspread_service_1.rangeGet)('person!B2:B', nm_const_1.GSPREAD_CORE_ID)
            // get rid of blanks
            .then((a) => (a === null || a === void 0 ? void 0 : a.filter((b) => b[0].trim())) || []));
    });
}
exports.getPersonNameList = getPersonNameList;
// toggle a person state to active
function setPersonActiveState(email, activeState) {
    return __awaiter(this, void 0, void 0, function* () {
        if (nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
            throw new Error('Must set active state');
        }
        // get all the person rows
        const personList = yield (0, gspread_service_1.rangeGet)('person!A:C', nm_const_1.GSPREAD_CORE_ID);
        // find a match to email
        // TODO: implement user id from discord?
        email = email.toLowerCase().trim();
        const rowIndex = personList === null || personList === void 0 ? void 0 : personList.findIndex((a) => a[2].toLowerCase().trim() === email);
        if (typeof rowIndex === 'undefined') {
            throw new Error('person does not exists');
        }
        const range = 'person!A' + (rowIndex + 1);
        // update cell for active at row and column index (add method to GSpreadService)
        yield (0, gspread_service_1.rowsWrite)([[activeState]], range, nm_const_1.GSPREAD_CORE_ID);
        return range;
    });
}
exports.setPersonActiveState = setPersonActiveState;
// toggle an org state to active
function setOrgActiveState(_name, activeState) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState)) {
            throw new Error('Must set active state');
        }
        // TODO:
        // get all the org rows
        // find a match to name
        // update cell for active at row and column index (add method to GSpreadService)
    });
}
exports.setOrgActiveState = setOrgActiveState;
