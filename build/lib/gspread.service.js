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
exports.sheetDestroy = exports.sheetCreate = exports.sheetCreateIfNone = exports.getSheetIdByName = exports.sheetExists = exports.rowsAppend = exports.rowsWrite = exports.rowsDelete = exports.rangeGet = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const auth = new google_auth_library_1.GoogleAuth({
    keyFile: 'keys.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});
const gspread = googleapis_1.google.sheets({ version: 'v4', auth });
function rangeGet(range, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        validate(range, spreadsheetId);
        const result = yield gspread.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        return result.data.values || [];
    });
}
exports.rangeGet = rangeGet;
function rowsDelete(startIndex, endIndex, sheetId, spreadsheetId) {
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
exports.rowsDelete = rowsDelete;
function rowsWrite(values, range, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!values || !(values instanceof Array) || !values.length) {
            throw new Error('Must pass a valid values');
        }
        validate(range, spreadsheetId);
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
exports.rowsWrite = rowsWrite;
/**
 *
 * @param values string values to insert in sheet
 * @param range where in the sheet to insert
 * @param spreadsheetId which spreadsheet to insert
 * @returns range that was affected
 */
function rowsAppend(values, range, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!values || !(values instanceof Array) || !values.length) {
            throw new Error('Must pass a valid values');
        }
        validate(range, spreadsheetId);
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
exports.rowsAppend = rowsAppend;
function sheetExists(title, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = yield getSheetIdByName(title, spreadsheetId);
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
exports.sheetExists = sheetExists;
function getSheetIdByName(title, spreadsheetId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const request = {
                spreadsheetId,
                ranges: [title],
                includeGridData: false
            };
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
exports.getSheetIdByName = getSheetIdByName;
function sheetCreateIfNone(title, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        // we create a new sheet every year, so we test if the sheet exists, and create it if not
        if (!(yield sheetExists(title, spreadsheetId))) {
            yield sheetCreate(title, spreadsheetId);
            return true;
        }
        return false;
    });
}
exports.sheetCreateIfNone = sheetCreateIfNone;
function sheetCreate(title, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        validate(title, spreadsheetId);
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
            console.log(error);
        }
        return false;
    });
}
exports.sheetCreate = sheetCreate;
function sheetDestroy(title, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        validate(title, spreadsheetId);
        try {
            const sheetId = yield getSheetIdByName(title, spreadsheetId);
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
exports.sheetDestroy = sheetDestroy;
// abstract out test for range and spreadsheetId
function validate(range, spreadsheetId) {
    if (!range) {
        throw new Error('Must pass a valid sheet "range"');
    }
    if (!spreadsheetId) {
        throw new Error('Must pass a valid spreadsheet id');
    }
}
