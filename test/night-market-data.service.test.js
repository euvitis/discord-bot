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
const night_market_data_service_1 = require("../src/lib/night-market-data.service");
(0, globals_1.describe)('NightMarketDataService', () => {
    (0, globals_1.test)('update a person active status in central spreadsheet', () => __awaiter(void 0, void 0, void 0, function* () {
        // await NightMarketDataService.setPersonActiveState(
        //   'christianco@gmail.com',
        //   'active'
        // );
        const a = yield (0, night_market_data_service_1.setPersonActiveState)('christianco@gmail.com', 'active');
        (0, globals_1.expect)(a).toBe('person!A35');
    }));
    (0, globals_1.test)('gets the list of orgs from central spreadsheet', () => __awaiter(void 0, void 0, void 0, function* () {
        const orgList = yield (0, night_market_data_service_1.getOrgNameList)();
        (0, globals_1.expect)(orgList.length).toBeGreaterThan(0);
        // TODO: we can test this once we have a delete row functionality
        // await NightMarketDataService.appendFoodCount([['hi', 'there']]);
    }));
});
