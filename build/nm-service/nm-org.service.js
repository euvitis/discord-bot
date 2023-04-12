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
exports.NmOrgService = void 0;
const nm_const_1 = require("../nm-const");
const service_1 = require("../service");
const config_1 = require("../config");
const { GSPREAD_CORE_ID } = (0, config_1.Config)();
// one hour: every hour the org list gets refreshed
const ORG_LIST_CACHE_EXPIRY = 1000 * 60 * 60;
let ORG_LIST_CACHE_TIME = Date.now(), OrgCacheList = [];
// TODO: make this a class service
class NmOrgService {
    static getOrgList({ active = false, flushCache = true } = {
        active: false,
        flushCache: true
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (
            // we have a list of orgs AND
            OrgCacheList.length &&
                // we are not flushing the cache AND
                !flushCache &&
                // the cache is not expired
                Date.now() - ORG_LIST_CACHE_TIME < ORG_LIST_CACHE_EXPIRY) {
                return OrgCacheList;
            }
            const r = ((yield service_1.GoogleSpreadsheetsService.rangeGet('org!A3:C', GSPREAD_CORE_ID)) || []);
            OrgCacheList = r
                .filter(([status, name]) => {
                if (active && status !== nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST[0]) {
                    return false;
                }
                // filter any blank names as well
                return !!name.trim();
            })
                .map(([_, name, nameAltList]) => {
                // if we have requested only active orgs
                // otherwise return just the name
                return {
                    name: name.trim(),
                    nameAltList: 
                    // spreadsheet service does not return a value if there is nothing defined
                    (nameAltList === null || nameAltList === void 0 ? void 0 : nameAltList.split(',').filter((a) => a.trim()).map((a) => a.trim())) || []
                };
            });
            return OrgCacheList;
        });
    }
    static getOrgNameList(opts = {
        active: false,
        flushCache: true
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.getOrgList(opts);
            return r.map((a) => a.name);
        });
    }
    // toggle an org state to active
    static setOrgActiveState(_name, activeState) {
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
}
exports.NmOrgService = NmOrgService;
