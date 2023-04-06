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
const google_spreadsheets_service_1 = require("./google-spreadsheets.service");
// makes it easier to find and change where data is in sheet columns
const ColumnMap = {
    EMAIL: 'C',
    NAME: 'B',
    STATUS: 'A',
    DISCORD_ID: 'N',
    LAST_COLUMN: 'N'
}, 
// exclude the header when we want only data
DATA_OFFSET = 2, 
// the name of the core sheet where all people are
CORE_PERSON_SHEET = 'person';
class NmPersonService {
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
            return google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(this.getColumnDataRangeName('NAME'), nm_const_1.GSPREAD_CORE_ID).then((a) => a[0]);
        });
    }
    static getEmailList() {
        return __awaiter(this, void 0, void 0, function* () {
            return google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(this.getColumnDataRangeName('EMAIL'), nm_const_1.GSPREAD_CORE_ID).then((a) => a[0]);
        });
    }
    static getAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            return google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(this.getFullPersonDataRangeName(), nm_const_1.GSPREAD_CORE_ID);
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
            const [status, name, email] = yield this.getRowByDiscordIdOrEmail(id);
            return email;
        });
    }
    static getRowByDiscordIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            idOrEmail = idOrEmail.toLowerCase().trim();
            const emailIndex = this.getColumnIndexByName('EMAIL');
            const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
            const a = yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(this.getFullPersonDataRangeName(), nm_const_1.GSPREAD_CORE_ID)
                .then((a) => a.filter((a) => {
                return (idOrEmail === a[emailIndex] ||
                    idOrEmail === a[discordIdIndex]);
            }))
                .then((a) => a.pop());
            return a || [];
        });
    }
    static getRowIndexByDiscordIdOrEmail(idOrEmail) {
        idOrEmail = idOrEmail.toLowerCase().trim();
        const emailIndex = this.getColumnIndexByName('EMAIL');
        const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
        return google_spreadsheets_service_1.GoogleSpreadsheetsService.rangeGet(this.getFullPersonDataRangeName(), nm_const_1.GSPREAD_CORE_ID).then((a) => a.findIndex((a) => {
            return (idOrEmail === a[emailIndex] ||
                idOrEmail === a[discordIdIndex]);
        }));
    }
    // toggle a person state to active
    static setActiveState(email, activeState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
                throw new Error('Must set active state');
            }
            // get all the person rows
            const personList = yield this.getEmailList();
            // find a match to email
            email = email.toLowerCase().trim();
            const rowIndex = personList === null || personList === void 0 ? void 0 : personList.findIndex((a) => a.toLowerCase().trim() === email);
            if (typeof rowIndex === 'undefined') {
                throw new Error('person does not exists');
            }
            const range = this.getColumnRangeName('STATUS', rowIndex + 1);
            // update cell for active at row and column index (add method to GSpreadService)
            yield google_spreadsheets_service_1.GoogleSpreadsheetsService.rowsWrite([[activeState]], range, nm_const_1.GSPREAD_CORE_ID);
            return range;
        });
    }
    // gets the row index number from named column
    static getColumnIndexByName(columnName) {
        return google_spreadsheets_service_1.GoogleSpreadsheetsService.alphabetIndexFromLetter(ColumnMap[columnName]);
    }
    // returns the full range for all the data minus the header
    static getFullPersonDataRangeName() {
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
}
exports.NmPersonService = NmPersonService;
