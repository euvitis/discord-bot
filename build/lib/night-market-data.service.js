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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightMarketDataService = void 0;
const fuzzy_search_1 = __importDefault(require("fuzzy-search"));
const gspread_service_1 = require("./gspread.service");
const GSPREAD_ID_CORE = '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek', GSPREAD_ID_FOOD_COUNT = '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM', ACTIVE_STATE_LIST = ['inactive', 'active'];
class NightMarketDataService {
    static appendFoodCount(rows) {
        return __awaiter(this, void 0, void 0, function* () {
            // the current year's sheet name
            const currentYearSheet = `inventory ${new Date().getFullYear()}`;
            // we create a new sheet every year, so we test if the sheet exists
            if (!(yield gspread_service_1.GSpreadService.sheetExists(currentYearSheet, GSPREAD_ID_FOOD_COUNT))) {
                // create it if not
                yield gspread_service_1.GSpreadService.sheetCreate(currentYearSheet, GSPREAD_ID_FOOD_COUNT);
            }
            return gspread_service_1.GSpreadService.rowsAppend(rows, currentYearSheet, GSPREAD_ID_FOOD_COUNT);
        });
    }
    static getOrgNameList(filter = '') {
        return __awaiter(this, void 0, void 0, function* () {
            let list = yield gspread_service_1.GSpreadService.rangeGet('Org!B2:B', GSPREAD_ID_CORE)
                // get rid of blanks
                .then((a) => (a === null || a === void 0 ? void 0 : a.filter((b) => b[0].trim())) || []);
            if (filter) {
                const searcher = new fuzzy_search_1.default(list, [], {
                    caseSensitive: false,
                    // sort by best match
                    sort: true
                });
                list = searcher.search(filter);
            }
            return list;
        });
    }
    static getPersonNameList() {
        return __awaiter(this, void 0, void 0, function* () {
            return (gspread_service_1.GSpreadService.rangeGet('Person!B2:B', GSPREAD_ID_CORE)
                // get rid of blanks
                .then((a) => (a === null || a === void 0 ? void 0 : a.filter((b) => b[0].trim())) || []));
        });
    }
    // TODO:
    // toggle a person state to active
    static setPersonActiveState(email, activeState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ACTIVE_STATE_LIST.indexOf(activeState)) {
                throw new Error('Must set active state');
            }
            // TODO:
            // get all the person rows
            // find a match to email
            // update cell for active at row and column index (add method to GSpreadService)
        });
    }
    // toggle an org state to active
    static setOrgActiveState(name, activeState) {
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
}
exports.NightMarketDataService = NightMarketDataService;
