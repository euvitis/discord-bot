import FuzzySearch from 'fuzzy-search';
import { GSpreadService } from './gspread.service';

const GSPREAD_ID_CORE = '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek',
  GSPREAD_ID_FOOD_COUNT = '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM',
  ACTIVE_STATE_LIST = ['inactive', 'active'];

export class NightMarketDataService {
  static async appendFoodCount(rows: string[][]) {
    // the current year's sheet name
    const currentYearSheet = `inventory ${new Date().getFullYear()}`;

    // we create a new sheet every year, so we test if the sheet exists
    if (
      !(await GSpreadService.sheetExists(
        currentYearSheet,
        GSPREAD_ID_FOOD_COUNT
      ))
    ) {
      // create it if not
      await GSpreadService.sheetCreate(currentYearSheet, GSPREAD_ID_FOOD_COUNT);
    }

    return GSpreadService.rowsAppend(
      rows,
      currentYearSheet,
      GSPREAD_ID_FOOD_COUNT
    );
  }

  static async getOrgNameList(filter = '') {
    let list = await GSpreadService.rangeGet('Org!B2:B', GSPREAD_ID_CORE)
      // get rid of blanks
      .then((a) => a?.filter((b: string[]) => b[0].trim()) || []);

    if (filter) {
      const searcher = new FuzzySearch(list, [], {
        caseSensitive: false,
        // sort by best match
        sort: true
      });
      list = searcher.search(filter);
    }
    return list;
  }

  static async getPersonNameList() {
    return (
      GSpreadService.rangeGet('Person!B2:B', GSPREAD_ID_CORE)
        // get rid of blanks
        .then((a) => a?.filter((b: string[]) => b[0].trim()) || [])
    );
  }
  // TODO:
  // toggle a person state to active
  static async setPersonActiveState(email: string, activeState: string) {
    if (ACTIVE_STATE_LIST.indexOf(activeState) < 0) {
      throw new Error('Must set active state');
    }
    // TODO:
    // get all the person rows
    const personList = await GSpreadService.rangeGet(
      'person!A:C',
      GSPREAD_ID_CORE
    );
    email = email.toLowerCase().trim();
    const rowIndex = personList?.findIndex(
      (a) => a[2].toLowerCase().trim() === email
    );
    if (typeof rowIndex === 'undefined') {
      throw new Error('person does not exists');
    }
    const range = 'person!A' + (rowIndex + 1);
    await GSpreadService.rowsWrite([[activeState]], range, GSPREAD_ID_CORE);
    return range;
    // find a match to email
    // update cell for active at row and column index (add method to GSpreadService)
  }
  // toggle an org state to active
  static async setOrgActiveState(name: string, activeState: string) {
    if (!ACTIVE_STATE_LIST.indexOf(activeState)) {
      throw new Error('Must set active state');
    }

    // TODO:
    // get all the org rows
    // find a match to name
    // update cell for active at row and column index (add method to GSpreadService)
  }
}
