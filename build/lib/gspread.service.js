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
exports.GSpreadService = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const auth = new google_auth_library_1.GoogleAuth({
    keyFile: 'keys.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});
const gspread = googleapis_1.google.sheets({ version: 'v4', auth });
exports.GSpreadService = {
    rangeGet: (range, spreadsheetId) => __awaiter(void 0, void 0, void 0, function* () {
        validate(range, spreadsheetId);
        const result = yield gspread.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        const numRows = result.data.values ? result.data.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
        return result.data.values;
    }),
    rowsAppend: (values, range, spreadsheetId) => __awaiter(void 0, void 0, void 0, function* () {
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
                r(response);
            });
        });
    }),
    sheetExists: (title, spreadsheetId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const request = {
                spreadsheetId,
                ranges: [title],
                includeGridData: false
            };
            const res = yield gspread.spreadsheets.get(request);
            return ((((_a = res.data.sheets) === null || _a === void 0 ? void 0 : _a.length) && ((_c = (_b = res.data.sheets[0]) === null || _b === void 0 ? void 0 : _b.properties) === null || _c === void 0 ? void 0 : _c.sheetId)) ||
                null);
        }
        catch (e) {
            return null;
        }
    }),
    sheetCreate: (title, spreadsheetId) => __awaiter(void 0, void 0, void 0, function* () {
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
            const resp = yield gspread.spreadsheets.batchUpdate(request);
        }
        catch (error) {
            console.log(error);
        }
    })
};
// abstract out test for range and spreadsheetId
function validate(range, spreadsheetId) {
    if (!range) {
        throw new Error('Must pass a valid sheet "range"');
    }
    if (!spreadsheetId) {
        throw new Error('Must pass a valid spreadsheet id');
    }
}
