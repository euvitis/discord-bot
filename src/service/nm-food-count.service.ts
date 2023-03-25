import { DayNameType } from '../model/night-market.model';
import { getOrgList } from './nm-org.service';
import FuzzySearch from 'fuzzy-search';
import { ParseContentService } from './parse-content.service';

export interface FoodCountParsedInputModel {
    lbs: number;
    org: string;
    orgFuzzy: string;
    note: string;
    filterString: string;
}

type FoodCountChannelStatusType =
    | 'COUNT_CHANNEL'
    | 'NIGHT_CHANNEL'
    | 'INVALID_CHANNEL';
// each input request is evaluated and given a status
type FoodCountInputStatusType =
    // when we have a count input with no errors
    | 'OK'
    // when we have a count input but there are one or more errors (multiline)
    | 'OK_WITH_ERRORS'
    // when we may have a count input, but are not sure because we did not get any valid input
    | 'ONLY_ERRORS'
    // when we have an invalid count we can parse no usable data
    | 'INVALID';

// we only allow food count in one channel
const COUNT_CHANNEL_NAME = 'food-count',
    // OR in a "night channel", which always corresponds to a day
    // this maps the night cap channel name to the day, so we can get a date from the channel name
    NIGHT_CHANNEL_NAMES_MAP: {
        [k in string]: DayNameType;
    } = {
        // property is the night-channel name, value is the name of a day
        monday: 'monday',
        tuesday: 'tuesday',
        wednesday: 'wednesday',
        thursday: 'thursday',
        friday: 'friday',
        saturday: 'saturday',
        sunday: 'sunday',
        // ? i guess saturday will work for weekends for now?
        weekends: 'saturday'
    };

export class NmFoodCountService {
    /* dealing with  messages sent */
    // todo: we should standardize these messages in central database, with maybe template engine
    static getMessageErrorNoLbsOrOrg({
        messageContent
    }: {
        messageContent: string;
    }) {
        return `We got "${messageContent}", which does not compute.
Please enter food count like this: 
  "<number of pounds> <pickup name>"
Example: 
  "8 Village Bakery"`;
    }

    static getMessageErrorNoLbs({ org }: { org: string }) {
        return `We cannot understand how many pounds for "${org}". 
Please try again like this: 
    "<number of pounds> <pickup name>"
Example: 
    "8 Village Bakery"`;
    }

    static getMessageErrorNoOrg({
        orgFuzzy,
        lbs
    }: {
        orgFuzzy: string;
        lbs: number;
    }) {
        return `We cannot find a pickup called "${orgFuzzy}". 
Please try again like this: 
    "${lbs} lbs <pickup name>"
Example: 
    "8 lbs Village Bakery"`;
    }

    /* Dealing with content => input */

    static isFoodCountChannelName(channelName: string): boolean {
        return channelName.toLowerCase() === COUNT_CHANNEL_NAME.toLowerCase();
    }

    static getChannelStatus(channelName: string): FoodCountChannelStatusType {
        if (channelName.toLowerCase() === COUNT_CHANNEL_NAME.toLowerCase()) {
            return 'COUNT_CHANNEL';
        }
        if (
            Object.keys(NIGHT_CHANNEL_NAMES_MAP)
                .map((a) => a.toLowerCase())
                .includes(channelName.toLowerCase())
        ) {
            return 'NIGHT_CHANNEL';
        }
        return 'INVALID_CHANNEL';
    }

    //  this is our main hook for getting the food count input from content
    static getParsedChannelAndContent(
        channelName: string,
        content: string
    ): [
        FoodCountChannelStatusType,
        FoodCountInputStatusType,
        string,
        FoodCountParsedInputModel[],
        FoodCountParsedInputModel[]
    ] {
        const channelStatus = this.getChannelStatus(channelName);

        let inputStatus: FoodCountInputStatusType = 'INVALID';

        if ('INVALID_CHANNEL' === channelStatus) {
            inputStatus = 'INVALID';

            // in this case we don't want to process anything, just return it
            return [channelStatus, inputStatus, '', [], []];
        }

        const [dateParsed, parsedInputList, parsedInputErrorList] =
            this.getFoodCountDateAndParsedInput(content);

        // the date is either in the content, or it is today
        let date = dateParsed || ParseContentService.dateFormat(new Date());

        // if we are in the night channel and we did not get a date from teh parser
        // then we get a date from the name of the channel
        if (!dateParsed && channelStatus === 'NIGHT_CHANNEL') {
            date = this.getDateFromNightChannelName(channelName);
        }

        //  if we DID get successful input, and we got NO errors
        if (parsedInputList.length > 0 && parsedInputErrorList.length === 0) {
            inputStatus = 'OK';
        }

        //  if we DID get successful input, and we DID get errors
        if (parsedInputList.length > 0 && parsedInputErrorList.length > 0) {
            inputStatus = 'OK_WITH_ERRORS';
        }

        //  if we got NO successful input, and we DID get errors
        if (parsedInputList.length === 0 && parsedInputErrorList.length > 0) {
            inputStatus = 'ONLY_ERRORS';
        }

        return [
            channelStatus,
            inputStatus,
            '',
            parsedInputList,
            parsedInputErrorList
        ];
    }

    private static getDateFromNightChannelName(channelName: string): string {
        return NmFoodCountService.getDateStringFromDay(
            NIGHT_CHANNEL_NAMES_MAP[channelName.toLowerCase()]
        );
    }

    static async getOrgListFromFuzzyString(
        orgFuzzy: string
    ): Promise<string[]> {
        const orgList = await getOrgList();
        const searcher = new FuzzySearch(orgList, ['name', 'nameAltList'], {
            caseSensitive: false,
            sort: true
        });

        return searcher.search(orgFuzzy).map((a) => a.name);
    }
    /**
     *
     * @param content string content that is multiline
     * @returns a date and a food count input list
     */
    private static getFoodCountDateAndParsedInput(
        content: string
    ): [string, FoodCountParsedInputModel[], FoodCountParsedInputModel[]] {
        //const orgList = NmFoodCountService.getOrgListFromFuzzyString();
        const inputList = content
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a);
        let lbs = 0,
            org = '',
            orgFuzzy = '',
            note = '',
            filterString = '';

        // todo: get the date from content if any
        let date = '';
        return [
            // todo: get the date
            date,
            inputList.map((a) => ({
                lbs,
                org,
                filterString,
                orgFuzzy,
                note
            })),
            // todo: this will be a list of error inputs
            []
        ];
    }

    private static getLbsAndString(content: string): [number, string] {
        const contentList = content.split(' ').filter((a: string) => a.trim());
        let lbsCount = NmFoodCountService.getNumberFromStringStart(
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
        lbsCount = NmFoodCountService.getNumberFromStringStart(
            contentList[contentList.length - 1]
        );
        if (lbsCount) {
            // get rid of the number
            contentList.pop();
            return [lbsCount, contentList.join(' ')];
        }

        // in this case the number was second to last, and it needs to be followed by a lbs or pounds
        lbsCount = NmFoodCountService.getNumberFromStringStart(
            contentList[contentList.length - 2]
        );
        if (lbsCount) {
            if (
                contentList[contentList.length - 1].toLowerCase() === 'lbs' ||
                contentList[contentList.length - 1].toLowerCase() === 'pounds'
            ) {
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
    private static getNumberFromStringStart(s: string = ''): number {
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

    private static getDateStringFromDay(day: DayNameType): string {
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

    // simply parse for a date that looks like MM/DD or MM/DD/YYYY

    // todo: i think this sucks. there must be an easier way to do this, like just ask them for the date in the confirm?
    // ok, we are going with a different method of parsing date: either we get the day from the channel name, or we
    // ask for a confirmation in the food-count channel.
    // static getDateFromString(s: string): [string, string] {
    //     let n = '';
    //     const d = new Date();
    //     const t = s.split(' ').filter((a) => a);
    //     const i = t.findIndex((a) => a.split('/').length > 1);
    //     if (i >= 0) {
    //         // there is a date proper in here, let us take it off of t
    //         const u = t.splice(i, 1).pop() || '';
    //         const v = u.split('/');
    //         if (v.length === 2) {
    //             if (v[0].length === 2 && v[1].length === 2) {
    //                 // ok good enough
    //                 n = v.join('/') + '/' + d.getFullYear();
    //             }
    //         } else if (v.length === 3) {
    //             if (
    //                 v[0].length === 2 &&
    //                 v[1].length === 2 &&
    //                 v[2].length === 4
    //             ) {
    //                 // ok good enough
    //                 n = v.join('/');
    //             }
    //         }
    //     }

    //     return [
    //         n || dateFormat(new Date(), 'mm/dd/yyyyy'),
    //         // at this point t has had the date string removed
    //         t.join(' ')
    //     ];
    // }
}
