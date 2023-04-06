"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseContentService = void 0;
class ParseContentService {
    static dateFormat(date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    static getLbsAndString(content) {
        const contentList = content.split(' ').filter((a) => a.trim());
        let lbsCount = ParseContentService.getNumberFromStringStart(contentList[0]);
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
        lbsCount = ParseContentService.getNumberFromStringStart(contentList[contentList.length - 1]);
        if (lbsCount) {
            // get rid of the number
            contentList.pop();
            return [lbsCount, contentList.join(' ')];
        }
        // in this case the number was second to last, and it needs to be followed by a lbs or pounds
        lbsCount = ParseContentService.getNumberFromStringStart(contentList[contentList.length - 2]);
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
        return ParseContentService.dateFormat(d);
    }
}
exports.ParseContentService = ParseContentService;
