import { ActiveStateType, PersonModel } from '../model/night-market.model';
import { GSPREAD_CORE_ACTIVE_STATE_LIST, GSPREAD_CORE_ID } from '../nm-const';
import { rangeGet, rowsWrite } from './gspread.service';
import {
    alphabetIndexFromLetter,
    alphabetLetterFromIndex
} from './gspread.service';
type ColumnMapKeyType = keyof typeof ColumnMap;

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

export class NmPersonService {
    static async getCleanNameList() {
        return this.getNameList().then((a) => a.filter((b) => b.trim()));
    }

    static async getCleanEmailList(): Promise<string[]> {
        return this.getEmailList().then((a) => a.filter((a) => a.trim()));
    }

    static async getNameList(): Promise<string[]> {
        return rangeGet(
            this.getColumnDataRangeName('NAME'),
            GSPREAD_CORE_ID
        ).then((a) => a[0]);
    }

    static async getEmailList(): Promise<string[]> {
        return rangeGet(
            this.getColumnDataRangeName('EMAIL'),
            GSPREAD_CORE_ID
        ).then((a) => a[0]);
    }
    static async getAllData(): Promise<string[][]> {
        return rangeGet(this.getFullPersonDataRangeName(), GSPREAD_CORE_ID);
    }

    static async getPersonByDiscorIdOrEmail(
        idOrEmail: string
    ): Promise<PersonModel> {
        const [
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
        ] = await this.getRowByDiscordIdOrEmail(idOrEmail);
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
    }

    static async getEmailByDiscordId(id: string): Promise<string> {
        const [status, name, email] = await this.getRowByDiscordIdOrEmail(id);
        return email;
    }

    static async getRowByDiscordIdOrEmail(
        idOrEmail: string
    ): Promise<string[]> {
        idOrEmail = idOrEmail.toLowerCase().trim();
        const emailIndex = this.getColumnIndexByName('EMAIL');
        const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
        const a = await rangeGet(
            this.getFullPersonDataRangeName(),
            GSPREAD_CORE_ID
        )
            .then((a) =>
                a.filter((a) => {
                    return (
                        idOrEmail === a[emailIndex] ||
                        idOrEmail === a[discordIdIndex]
                    );
                })
            )
            .then((a) => a.pop());
        return a || [];
    }

    static getRowIndexByDiscordIdOrEmail(idOrEmail: string): Promise<number> {
        idOrEmail = idOrEmail.toLowerCase().trim();
        const emailIndex = this.getColumnIndexByName('EMAIL');
        const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
        return rangeGet(
            this.getFullPersonDataRangeName(),
            GSPREAD_CORE_ID
        ).then((a) =>
            a.findIndex((a) => {
                return (
                    idOrEmail === a[emailIndex] ||
                    idOrEmail === a[discordIdIndex]
                );
            })
        );
    }

    // toggle a person state to active
    static async setActiveState(email: string, activeState: ActiveStateType) {
        if (GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
            throw new Error('Must set active state');
        }
        // get all the person rows
        const personList = await this.getEmailList();

        // find a match to email
        email = email.toLowerCase().trim();
        const rowIndex = personList?.findIndex(
            (a) => a.toLowerCase().trim() === email
        );

        if (typeof rowIndex === 'undefined') {
            throw new Error('person does not exists');
        }

        const range = this.getColumnRangeName('STATUS', rowIndex + 1);

        // update cell for active at row and column index (add method to GSpreadService)
        await rowsWrite([[activeState]], range, GSPREAD_CORE_ID);
        return range;
    }

    // gets the row index number from named column
    static getColumnIndexByName(columnName: ColumnMapKeyType) {
        return alphabetIndexFromLetter(ColumnMap[columnName]);
    }

    // returns the full range for all the data minus the header
    static getFullPersonDataRangeName(): string {
        return `${CORE_PERSON_SHEET}!A${DATA_OFFSET}${ColumnMap.LAST_COLUMN}`;
    }

    // returns a range for a data set minus the header
    static getColumnDataRangeName(columnName: ColumnMapKeyType): string {
        return this.getColumnRangeName(
            columnName,
            DATA_OFFSET,
            ColumnMap[columnName]
        );
    }

    static getColumnRangeName(
        columnName: ColumnMapKeyType,
        // defaults to full column
        index: number = 0,
        // optionally, get columns that follow
        endCol?: string
    ): string {
        return `${CORE_PERSON_SHEET}!${ColumnMap[columnName]}${
            index ? index : ''
        }${endCol ? `:${endCol}` : ''}`;
    }
}
