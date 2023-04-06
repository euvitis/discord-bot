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
exports.setOrgActiveState = exports.getOrgNameList = void 0;
const nm_const_1 = require("../nm-const");
const gspread_service_1 = require("./gspread.service");
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
