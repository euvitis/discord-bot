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
const globals_1 = require("@jest/globals");
const night_market_data_service_1 = require("./night-market-data.service");
(0, globals_1.describe)('NightMarketDataService', () => {
    (0, globals_1.test)('gets the list of orgs from central spreadsheet', () => __awaiter(void 0, void 0, void 0, function* () {
        const orgList = yield night_market_data_service_1.NightMarketDataService.getOrgNameList();
        (0, globals_1.expect)(orgList.length).toBeGreaterThan(0);
    }));
});
