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
exports.setPersonActiveState = exports.getPersonNameList = void 0;
const nm_const_1 = require("../nm-const");
const gspread_service_1 = require("./gspread.service");
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
