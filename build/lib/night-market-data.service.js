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
exports.setOrgActiveState = exports.setPersonActiveState = exports.getPersonNameList = exports.getOrgNameList = exports.appendFoodCount = void 0;
const gspread_service_1 = require("./gspread.service");
const GSPREAD_ID_CORE = '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek';
const GSPREAD_ID_FOOD_COUNT = '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM';
const ACTIVE_STATE_LIST = ['active', 'inactive'];
function appendFoodCount(counts) {
    return __awaiter(this, void 0, void 0, function* () {
        // the current year's sheet name
        const sheet = `inventory ${new Date().getFullYear()}`;
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (!(yield (0, gspread_service_1.sheetExists)(sheet, GSPREAD_ID_FOOD_COUNT))) {
            yield (0, gspread_service_1.sheetCreate)(sheet, GSPREAD_ID_FOOD_COUNT);
        }
        const rows = counts.map((count) => {
            var _a, _b, _c;
            return [
                count.org,
                count.date,
                (_a = count.item) !== null && _a !== void 0 ? _a : '',
                count.unit,
                count.quantity,
                (_b = count.coordinator) !== null && _b !== void 0 ? _b : '',
                (_c = count.captain) !== null && _c !== void 0 ? _c : ''
            ];
        });
        return (0, gspread_service_1.rowsAppend)(rows, sheet, GSPREAD_ID_FOOD_COUNT);
    });
}
exports.appendFoodCount = appendFoodCount;
function getOrgNameList() {
    return __awaiter(this, void 0, void 0, function* () {
        const r = ((yield (0, gspread_service_1.rangeGet)('org!A3:B', GSPREAD_ID_CORE)) || []);
        return r
            .map(([status, name]) => {
            if (status == ACTIVE_STATE_LIST[0]) {
                return name;
            }
            return '';
        })
            .filter((a) => a);
    });
}
exports.getOrgNameList = getOrgNameList;
function getPersonNameList() {
    return __awaiter(this, void 0, void 0, function* () {
        return ((0, gspread_service_1.rangeGet)('Person!B2:B', GSPREAD_ID_CORE)
            // get rid of blanks
            .then((a) => (a === null || a === void 0 ? void 0 : a.filter((b) => b[0].trim())) || []));
    });
}
exports.getPersonNameList = getPersonNameList;
// toggle a person state to active
function setPersonActiveState(email, activeState) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
            throw new Error('Must set active state');
        }
        // get all the person rows
        const personList = yield (0, gspread_service_1.rangeGet)('person!A:C', GSPREAD_ID_CORE);
        // find a match to email
        // TODO: implement user id from discord?
        email = email.toLowerCase().trim();
        const rowIndex = personList === null || personList === void 0 ? void 0 : personList.findIndex((a) => a[2].toLowerCase().trim() === email);
        if (typeof rowIndex === 'undefined') {
            throw new Error('person does not exists');
        }
        const range = 'person!A' + (rowIndex + 1);
        // update cell for active at row and column index (add method to GSpreadService)
        yield (0, gspread_service_1.rowsWrite)([[activeState]], range, GSPREAD_ID_CORE);
        return range;
    });
}
exports.setPersonActiveState = setPersonActiveState;
// toggle an org state to active
function setOrgActiveState(_name, activeState) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ACTIVE_STATE_LIST.indexOf(activeState)) {
            throw new Error('Must set active state');
        }
        // TODO:
        // get all the org rows
        // find a match to name
        // update cell for active at row and column index (add method to GSpreadService)
    });
}
exports.setOrgActiveState = setOrgActiveState;
