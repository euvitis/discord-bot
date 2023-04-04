import { DayNameType } from '../model/night-market.model';
import { getOrgList } from './nm-org.service';
import FuzzySearch from 'fuzzy-search';
import { ParseContentService } from './parse-content.service';

// what type of channel are we in?
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

// each input request gets a date
type FoodCountInputDateStatusType =
    // when the date is in the content
    | 'DATE_PARSED'
    // when the date is derived from the channel
    | 'DATE_CHANNEL'
    // when the date is the default, today
    | 'DATE_TODAY';

// each line of input is a separate data entry, we give each one a status
type FoodCountInputDataStatusType =
    // when we have a count input with no errors
    | 'OK'
    // when we have a count input but there are one or more errors (multiline)
    | 'NO_LBS'
    // when we may have a count input, but are not sure because we did not get any valid input
    | 'NO_ORG'
    // when we have an invalid count we can parse no usable data
    | 'NO_LBS_OR_ORG';

export interface FoodCountParsedInputModel {
    status: FoodCountInputDataStatusType;
    lbs: number;
    org: string;
    orgFuzzy: string;
    note: string;
    filterString: string;
}
interface FoodCountParsedInputSuccessModel extends FoodCountParsedInputModel {
    status: 'OK';
}
interface FoodCountParsedInputFailModel extends FoodCountParsedInputModel {
    status: Exclude<FoodCountInputDataStatusType, 'OK'>;
}

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
    static async getParsedChannelAndContent(
        channelName: string,
        content: string
    ): Promise<
        [
            FoodCountChannelStatusType,
            FoodCountInputStatusType,
            FoodCountInputDateStatusType,
            string,
            FoodCountParsedInputModel[],
            FoodCountParsedInputModel[]
        ]
    > {
        const channelStatus = this.getChannelStatus(channelName);

        let inputStatus: FoodCountInputStatusType = 'INVALID',
            dateStatus: FoodCountInputDateStatusType,
            date = ParseContentService.dateFormat(new Date());

        if ('INVALID_CHANNEL' === channelStatus) {
            inputStatus = 'INVALID';

            // in this case we don't want to process anything, just return it
            return [channelStatus, inputStatus, 'DATE_TODAY', date, [], []];
        }

        const [dateParsed, parsedInputList, parsedInputErrorList] =
            await this.getFoodCountDateAndParsedInput(content);

        dateStatus = dateParsed ? 'DATE_PARSED' : 'DATE_TODAY';
        console.log(date, dateStatus, dateParsed);
        // the date is either in the content, or it is today
        if (dateStatus === 'DATE_PARSED') {
            date = dateParsed;
        }
        // if we are in the night channel and we did not get a date from teh parser
        // then we get a date from the name of the channel
        if (dateStatus === 'DATE_TODAY' && channelStatus === 'NIGHT_CHANNEL') {
            date = this.getDateFromNightChannelName(channelName);
            dateStatus = 'DATE_CHANNEL';
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
            dateStatus,
            date,
            parsedInputList,
            parsedInputErrorList
        ];
    }

    static getDateFromNightChannelName(channelName: string): string {
        return NmFoodCountService.getDateStringFromDay(
            NIGHT_CHANNEL_NAMES_MAP[channelName.toLowerCase()]
        );
    }

    static async getOrgAndNodeFromString(
        s: string
    ): Promise<[string, string, string]> {
        const a = s.split(',');
        const fuzzyOrg = a[0]?.trim() || '',
            note = a[1]?.trim() || '',
            org =
                (await this.getOrgListFromFuzzyString(fuzzyOrg)).shift() || '';

        return [org, fuzzyOrg, note];
    }

    static async getOrgListFromFuzzyString(
        orgFuzzy: string
    ): Promise<string[]> {
        const orgList = (await getOrgList()).map((a) => ({
            ...a,
            nameSearchable: a.nameAltList.join(' ') + ' ' + a.name
        }));
        const searcher = new FuzzySearch(orgList, ['nameSearchable'], {
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
    static async getFoodCountDateAndParsedInput(
        content: string
    ): Promise<
        [
            string,
            FoodCountParsedInputSuccessModel[],
            FoodCountParsedInputFailModel[]
        ]
    > {
        let [date, contentLessDate] = this.parseDateFromContent(content);

        // TODO: parse the date and lines
        //const orgList = NmFoodCountService.getOrgListFromFuzzyString();
        const inputList = contentLessDate
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a);
        const inputDataList: FoodCountParsedInputModel[] = [];
        for (const a of inputList) {
            let status: FoodCountInputDataStatusType = 'OK';
            const [lbs, filterString] = this.getLbsAndString(a);

            // todo: check for lbs first, so we save a trip to the db
            const [org, orgFuzzy, note] = await this.getOrgAndNodeFromString(
                filterString
            );

            // so this is important because we can
            // use the status here to decide if we prompt
            // user or not. IE in a night channel,
            // if we get a list of orgs, maybe we prompt but otherwise no
            // in the count channel, we always prompt
            if (!lbs && !org) {
                status = 'NO_LBS_OR_ORG';
            } else if (!lbs) {
                status = 'NO_LBS';
            } else if (!org) {
                status = 'NO_ORG';
            }

            inputDataList.push({
                status,
                lbs,
                org,
                filterString,
                orgFuzzy,
                note
            });
        }
        // todo: get the date from content if any
        return [
            // todo: get the date
            date,
            inputDataList.filter(
                (a) => a.status === 'OK'
            ) as FoodCountParsedInputSuccessModel[],
            // todo: this will be a list of error inputs
            inputDataList.filter(
                (a) => a.status !== 'OK'
            ) as FoodCountParsedInputFailModel[]
        ];
    }

    static getLbsAndString(content: string): [number, string] {
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
                contentList[0]?.toLowerCase() === 'lbs' ||
                contentList[0]?.toLowerCase() === 'pounds'
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
    static getNumberFromStringStart(s: string = ''): number {
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

    static getDateStringFromDay(day: DayNameType): string {
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
    static parseDateFromContent(s: string): [string, string] {
        // we simply want to know if the start of the string looks like mm/dd/yyyy or mm/dd
        const potentialDate = s
                .trim()
                .split('\n')[0]
                ?.split(' ')[0]
                ?.split('/'),
            originalDate = potentialDate.join('/');

        // in this case we don't have anything that looks like our date

        // if it is too short or long
        if (potentialDate.length < 2 || potentialDate.length > 3) {
            return ['', s];
        }

        // if any of the strings is not a number
        for (const i of potentialDate) {
            if (isNaN(+i)) {
                return ['', s];
            }
        }

        // it is not a month
        if (+potentialDate[0] > 12 || +potentialDate[0] < 1) {
            return ['', s];
        }

        // it is not a day of the month
        if (+potentialDate[1] > 31 || +potentialDate[1] < 1) {
            return ['', s];
        }

        // it is not a year
        if (+potentialDate[2] && potentialDate[2].length > 4) {
            return ['', s];
        }

        const theYear = '' + new Date().getFullYear();

        if (potentialDate.length == 2) {
            // if no year, add
            potentialDate[2] = theYear;
        } else if (potentialDate[2].length === 2) {
            // if year is two digits, make it four
            potentialDate[2] = theYear.slice(0, 2) + potentialDate[2];
        }

        return [
            potentialDate.join('/'),
            s.trim().replace(originalDate, '').trim()
        ];
    }
}
