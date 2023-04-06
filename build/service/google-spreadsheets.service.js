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
exports.GoogleSpreadsheetsService = exports.Alphabet = exports.AlphaIndex = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const nm_config_service_1 = require("./nm-config.service");
// the alphabet indexed in array
exports.AlphaIndex = Array.from(Array(26)).map((e, i) => i + 65);
// the alphabet in an array
exports.Alphabet = exports.AlphaIndex.map((x) => String.fromCharCode(x).toUpperCase());
const Gspread = nm_config_service_1.NmConfigService.getParsed().then((config) => {
    const credentials = config.googleSpreadsheetsKeys;
    const auth = new google_auth_library_1.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });
    return [googleapis_1.google.sheets({ version: 'v4', auth }), auth];
});
class GoogleSpreadsheetsService {
    static columnIndexFromLetter(a) {
        const n = exports.Alphabet.indexOf(a.toUpperCase());
        if (n < 0) {
            throw new Error('that letter does not exists');
        }
        return n;
    }
    static rangeGet(range, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            validate(range, spreadsheetId);
            const [gspread] = yield Gspread;
            const result = yield gspread.spreadsheets.values.get({
                spreadsheetId,
                range
            });
            return result.data.values || [];
        });
    }
    static rowsDelete(startIndex, endIndex, sheetId, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestBody = {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId,
                                dimension: 'ROWS',
                                startIndex,
                                endIndex
                            }
                        }
                    }
                ]
            };
            const [gspread] = yield Gspread;
            try {
                yield gspread.spreadsheets.batchUpdate({
                    spreadsheetId,
                    requestBody
                });
            }
            catch (err) {
                // TODO (Developer) - Handle exception
                throw err;
            }
        });
    }
    static rowsWrite(values, range, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values || !(values instanceof Array) || !values.length) {
                throw new Error('Must pass a valid values');
            }
            validate(range, spreadsheetId);
            const [gspread] = yield Gspread;
            try {
                const result = yield gspread.spreadsheets.values.update({
                    spreadsheetId,
                    valueInputOption: 'RAW',
                    range,
                    requestBody: { values }
                });
                console.log('%d cells updated.', result.data.updatedCells);
                return result.data.updatedRange;
            }
            catch (err) {
                // TODO (Developer) - Handle exception
                throw err;
            }
        });
    }
    /**
     *
     * @param values string values to insert in sheet
     * @param range where in the sheet to insert
     * @param spreadsheetId which spreadsheet to insert
     * @returns range that was affected
     */
    static rowsAppend(values, range, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values || !(values instanceof Array) || !values.length) {
                throw new Error('Must pass a valid values');
            }
            validate(range, spreadsheetId);
            const [gspread] = yield Gspread;
            return new Promise((r, x) => {
                gspread.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values }
                }, function (err, response) {
                    if (err) {
                        x(err);
                    }
                    r(response.data.updates.updatedRange);
                });
            });
        });
    }
    static sheetExists(title, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = yield this.getSheetIdByName(title, spreadsheetId);
                const request = {
                    spreadsheetId,
                    ranges: [title],
                    includeGridData: false
                };
                // if we get a positive number the sheet exists
                return id >= 0;
            }
            catch (e) {
                // if we get an error the sheet does not exist
                return false;
            }
        });
    }
    static getSheetIdByName(title, spreadsheetId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = {
                    spreadsheetId,
                    ranges: [title],
                    includeGridData: false
                };
                const [gspread] = yield Gspread;
                const res = yield gspread.spreadsheets.get(request);
                if (!((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.sheets) === null || _b === void 0 ? void 0 : _b.length) ||
                    (!((_e = (_d = (_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.sheets[0]) === null || _d === void 0 ? void 0 : _d.properties) === null || _e === void 0 ? void 0 : _e.sheetId) &&
                        !(((_h = (_g = (_f = res === null || res === void 0 ? void 0 : res.data) === null || _f === void 0 ? void 0 : _f.sheets[0]) === null || _g === void 0 ? void 0 : _g.properties) === null || _h === void 0 ? void 0 : _h.sheetId) || 0 >= 0))) {
                    throw new Error(`Sheet ${title} does not exist in spreadsheet ${spreadsheetId}`);
                }
                return ((_l = (_k = (_j = res === null || res === void 0 ? void 0 : res.data) === null || _j === void 0 ? void 0 : _j.sheets[0]) === null || _k === void 0 ? void 0 : _k.properties) === null || _l === void 0 ? void 0 : _l.sheetId) || 0;
            }
            catch (e) {
                throw e;
            }
        });
    }
    static sheetCreateIfNone(title, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            // we create a new sheet every year, so we test if the sheet exists, and create it if not
            if (!(yield this.sheetExists(title, spreadsheetId))) {
                yield this.sheetCreate(title, spreadsheetId);
                return true;
            }
            return false;
        });
    }
    static sheetCreate(title, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            validate(title, spreadsheetId);
            const [gspread, auth] = yield Gspread;
            try {
                const request = {
                    spreadsheetId,
                    resource: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title
                                    }
                                }
                            }
                        ]
                    },
                    auth
                };
                yield gspread.spreadsheets.batchUpdate(request);
                return true;
            }
            catch (error) {
                console.error(error);
            }
            return false;
        });
    }
    static sheetDestroy(title, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            validate(title, spreadsheetId);
            const [gspread, auth] = yield Gspread;
            try {
                const sheetId = yield this.getSheetIdByName(title, spreadsheetId);
                const request = {
                    spreadsheetId,
                    resource: {
                        requests: [
                            {
                                deleteSheet: {
                                    sheetId
                                }
                            }
                        ]
                    },
                    auth
                };
                yield gspread.spreadsheets.batchUpdate(request);
                return true;
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
}
exports.GoogleSpreadsheetsService = GoogleSpreadsheetsService;
// abstract out test for range and spreadsheetId
function validate(range, spreadsheetId) {
    if (!range) {
        throw new Error('Must pass a valid sheet "range"');
    }
    if (!spreadsheetId) {
        throw new Error('Must pass a valid spreadsheet id');
    }
}
