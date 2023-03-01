export class ParseContentService {
    static getLbsAndString(content: string): [number, string] {
        const contentList = content.split(' ').filter((a: string) => a.trim());
        let lbsCount = ParseContentService.getNumberFromStringStart(
            contentList[0]
        );
        // in this case the number was first
        if (lbsCount) {
            // get rid of the number
            contentList.shift();
            // get rid of any lbs or pounds text
            if (
                contentList[0].toLowerCase() === 'lbs' ||
                contentList[0].toLowerCase() === 'pounds'
            ) {
                contentList.shift();
            }
            return [lbsCount, contentList.join(' ')];
        }

        // in this case the number was last
        lbsCount = ParseContentService.getNumberFromStringStart(
            contentList[contentList.length - 1]
        );
        if (lbsCount) {
            // get rid of the number
            contentList.shift();
            return [lbsCount, contentList.join(' ')];
        }

        // in this case the number was second to last, and it needs to be followed by a lbs or pounds
        lbsCount = ParseContentService.getNumberFromStringStart(
            contentList[contentList.length - 2]
        );
        if (lbsCount) {
            if (
                contentList[0].toLowerCase() === 'lbs' ||
                contentList[0].toLowerCase() === 'pounds'
            ) {
                // get rid of the pounds or lbs
                contentList.shift();
                // get rid of the number
                contentList.shift();
                return [lbsCount, contentList.join(' ')];
            }
        }
        // in this case there was no number, so we return a falsy zero and let them pick one
        return [lbsCount || 0, contentList.join(' ')];
    }
    static getNumberFromStringStart(s: string): number {
        let c = 0;
        for (let a = 0; a < s.length; a++) {
            // if the first char is not a number, return zero
            const b = +s[a];
            if (!a && isNaN(b)) {
                a = s.length;
            } else {
                if (!isNaN(b)) {
                    c = +(c + '' + b);
                }
            }
        }
        return c;
    }

    // simply parse for a date that looks like MM/DD or MM/DD/YYYY
    static getDateFromString(s: string) {
        let n = '';
        const t = s.split(' ').filter((a) => a);
        const i = t.findIndex((a) => a.split('/').length > 1);
        if (i < 0) {
            // there is no date proper in here
            return n;
        }

        n = t.splice(i, 1).pop() || '';
        return n;
    }
}
