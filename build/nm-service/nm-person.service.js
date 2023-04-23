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
exports.NmPersonService = void 0;
const nm_const_1 = require("../nm-const");
const service_1 = require("../service");
const config_1 = require("../config");
const { GSPREAD_CORE_ID } = (0, config_1.Config)();
// makes it easier to find and change where data is in sheet columns
const ColumnMap = {
    EMAIL: 'C',
    NAME: 'B',
    STATUS: 'A',
    DISCORD_ID: 'N',
    LAST_COLUMN: 'N'
};
// exclude the header when we want only data
const DATA_OFFSET = 2;
// the name of the core sheet where all people are
const CORE_PERSON_SHEET = 'person';
const PERSON_LIST_CACHE_EXPIRY = 1000 * 60 * 60; // one hour until cache refresh
// we use a cache so we do not have to go to Google spreadsheet everytime we want the people
let personListCache = [], personListCacheLastUpdate = Date.now();
class NmPersonService {
    static getPersonList() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!personListCache.length ||
                Date.now() - PERSON_LIST_CACHE_EXPIRY > personListCacheLastUpdate) {
                personListCacheLastUpdate = Date.now();
                // TODO: we probably only want the active people in the cache
                personListCache = (yield this.getAllDataWithoutHeader()).map(this.createFromData);
            }
            return personListCache;
        });
    }
    static createFromData(a) {
        // todo: make a better mapping, maybe map header to column, make it easier to edit spreadhseet without fuckup script?
        return {
            status: a[0].trim(),
            name: a[1].trim(),
            email: a[2].trim(),
            phone: a[3].trim(),
            location: a[4].trim(),
            bike: a[5].trim(),
            bikeCart: a[6].trim(),
            bikeCartAtNight: a[7].trim(),
            skills: a[8].trim(),
            bio: a[9].trim(),
            pronouns: a[10].trim(),
            interest: a[11].trim(),
            reference: a[12].trim(),
            discordId: a[13].trim()
        };
    }
    static getCleanNameList() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getNameList().then((a) => a.filter((b) => b.trim()));
        });
    }
    static getCleanEmailList() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getEmailList().then((a) => a.filter((a) => a.trim()));
        });
    }
    static getNameList() {
        return __awaiter(this, void 0, void 0, function* () {
            return service_1.GoogleSpreadsheetsService.rangeGet(this.getColumnDataRangeName('NAME'), GSPREAD_CORE_ID).then((a) => a[0]);
        });
    }
    static getEmailList() {
        return __awaiter(this, void 0, void 0, function* () {
            return service_1.GoogleSpreadsheetsService.rangeGet(this.getColumnDataRangeName('EMAIL'), GSPREAD_CORE_ID).then((a) => a.map((b) => b[0]));
        });
    }
    static getAllDataWithoutHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield service_1.GoogleSpreadsheetsService.rangeGet(this.getFullPersonDataRangeName(), GSPREAD_CORE_ID)).filter((_a, i) => !!i);
        });
    }
    static getAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            return service_1.GoogleSpreadsheetsService.rangeGet(this.getFullPersonDataRangeName(), GSPREAD_CORE_ID);
        });
    }
    static getPersonRangeByDiscorIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const personRange = '';
            return personRange;
        });
    }
    static getPersonByDiscorIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const [status, name, email, phone, location, bike, bikeCart, bikeCartAtNight, skills, bio, pronouns, interest, reference, discordId] = yield this.getRowByDiscordIdOrEmail(idOrEmail);
            return {
                status,
                name,
                email,
                phone,
                location,
                bike,
                bikeCart,
                bikeCartAtNight,
                skills,
                bio,
                pronouns,
                interest,
                reference,
                discordId
            };
        });
    }
    static getEmailByDiscordId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [_status, _name, email] = yield this.getRowByDiscordIdOrEmail(id);
            return email;
        });
    }
    static getRowByDiscordIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            idOrEmail = idOrEmail.toLowerCase().trim();
            const emailIndex = this.getColumnIndexByName('EMAIL');
            const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
            const a = yield service_1.GoogleSpreadsheetsService.rangeGet(this.getFullPersonDataRangeName(), GSPREAD_CORE_ID)
                .then((a) => a.filter((a) => {
                return (idOrEmail === a[emailIndex] ||
                    idOrEmail === a[discordIdIndex]);
            }))
                .then((a) => a.pop());
            return a || [];
        });
    }
    static getRowIndexByDiscordIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            idOrEmail = idOrEmail.toLowerCase().trim();
            const emailIndex = this.getColumnIndexByName('EMAIL');
            const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
            return service_1.GoogleSpreadsheetsService.rangeGet(this.getFullPersonDataRangeName(), GSPREAD_CORE_ID).then((a) => a.findIndex((a) => {
                var _b, _c;
                return (idOrEmail === ((_b = a[emailIndex]) === null || _b === void 0 ? void 0 : _b.trim()) ||
                    idOrEmail === ((_c = a[discordIdIndex]) === null || _c === void 0 ? void 0 : _c.trim()));
            }) + 1);
        });
    }
    // toggle a person state to active
    static setActiveState(email, activeState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
                throw new Error(`Must set active state to one of ${nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST.join(', ')}`);
            }
            // get all the person rows
            const rowIndex = yield this.getRowIndexByDiscordIdOrEmail(email);
            if (!rowIndex) {
                throw new Error('person does not exists');
            }
            const range = this.getColumnRangeName('STATUS', rowIndex);
            // update cell for active at row and column index (add method to GSpreadService)
            yield service_1.GoogleSpreadsheetsService.rowsWrite([[activeState]], range, GSPREAD_CORE_ID);
            return range;
        });
    }
    // gets the row index number from named column
    static getColumnIndexByName(columnName) {
        return service_1.GoogleSpreadsheetsService.columnIndexFromLetter(ColumnMap[columnName]);
    }
    // returns the full range for all the person data
    static getFullPersonDataRangeName() {
        return `${CORE_PERSON_SHEET}!A:${ColumnMap.LAST_COLUMN}`;
    }
    // returns the full range for all the person data minus the header
    static getFullPersonDataRangeNameWithoutHeader() {
        return `${CORE_PERSON_SHEET}!A${DATA_OFFSET}:${ColumnMap.LAST_COLUMN}`;
    }
    // returns a range for a data set minus the header
    static getColumnDataRangeName(columnName) {
        return this.getColumnRangeName(columnName, DATA_OFFSET, ColumnMap[columnName]);
    }
    static getColumnRangeName(columnName, 
    // defaults to full column
    index = 0, 
    // optionally, get columns that follow
    endCol) {
        return `${CORE_PERSON_SHEET}!${ColumnMap[columnName]}${index ? index : ''}${endCol ? `:${endCol}` : ''}`;
    }
    static getCellRangeName(columnName, 
    // defaults to full column
    index) {
        if (!index) {
            throw new Error('must have an index to get a row range name');
        }
        return `${CORE_PERSON_SHEET}!${ColumnMap[columnName]}${index ? index : ''}`;
    }
}
exports.NmPersonService = NmPersonService;
