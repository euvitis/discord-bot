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
exports.NmParseContentService = void 0;
const nm_org_service_1 = require("./nm-org.service");
const fuzzy_search_1 = __importDefault(require("fuzzy-search"));
class NmParseContentService {
    static dateFormat(date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    static getFoodCountChannelStatus(channelType) {
        return __awaiter(this, void 0, void 0, function* () {
            return 'INVALID_CHANNEL';
        });
    }
    static getFoodCountInputStatus(channelType) {
        return __awaiter(this, void 0, void 0, function* () {
            FoodCountInputStatusType;
        });
    }
    static getOrgListFromFuzzyString(orgFuzzy) {
        return __awaiter(this, void 0, void 0, function* () {
            const orgList = yield (0, nm_org_service_1.getOrgList)();
            const searcher = new fuzzy_search_1.default(orgList, ['name', 'nameAltList'], {
                caseSensitive: false,
                sort: true
            });
            return searcher.search(orgFuzzy).map((a) => a.name);
        });
    }
    /**
     *
     * @param content string content that is multiline
     * @returns a food count input object
     */
    static getFoodCountInputList(content) {
        //const orgList = NmParseContentService.getOrgListFromFuzzyString();
        const inputList = content
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a);
        let lbs = 0, org = '', orgFuzzy = '', note = '', filterString = '';
        return inputList.map((a) => ({
            lbs,
            org,
            filterString,
            orgFuzzy,
            note
        }));
    }
    static getLbsAndString(content) {
        const contentList = content.split(' ').filter((a) => a.trim());
        let lbsCount = NmParseContentService.getNumberFromStringStart(contentList[0]);
        // in this case the number was first
        if (lbsCount) {
            // get rid of the number
            contentList.shift();
            // get rid of any lbs or pounds text
            if (contentList[0].toLowerCase() === 'lbs' ||
                contentList[0].toLowerCase() === 'pounds') {
                contentList.shift();
            }
            return [lbsCount, contentList.join(' ')];
        }
        // in this case the number was last
        lbsCount = NmParseContentService.getNumberFromStringStart(contentList[contentList.length - 1]);
        if (lbsCount) {
            // get rid of the number
            contentList.pop();
            return [lbsCount, contentList.join(' ')];
        }
        // in this case the number was second to last, and it needs to be followed by a lbs or pounds
        lbsCount = NmParseContentService.getNumberFromStringStart(contentList[contentList.length - 2]);
        if (lbsCount) {
            if (contentList[contentList.length - 1].toLowerCase() === 'lbs' ||
                contentList[contentList.length - 1].toLowerCase() === 'pounds') {
                // get rid of the pounds or lbs
                contentList.pop();
                // get rid of the number
                contentList.pop();
                return [lbsCount, contentList.join(' ')];
            }
        }
        // in this case there was no number, so we return a falsy zero and let them pick one
        return [lbsCount || 0, contentList.join(' ')];
    }
    static getNumberFromStringStart(s = '') {
        let c = 0;
        for (let a = 0; a < s.length; a++) {
            // if the first char is not a number, return zero
            const b = +s[a];
            if (!a && isNaN(b)) {
                a = s.length;
            }
            else {
                if (!isNaN(b)) {
                    c = +(c + '' + b);
                }
            }
        }
        return c;
    }
    static getDateStringFromDay(day) {
        var days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];
        // starting with the current date
        let d = new Date();
        while (day !== days[d.getDay()]) {
            // count backwards until we have the right day
            d.setDate(d.getDate() - 1);
        }
        return NmParseContentService.dateFormat(d);
    }
}
exports.NmParseContentService = NmParseContentService;
