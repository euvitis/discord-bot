const FuzzySearch = require('fuzzy-search');

const GSpreadService = require('./gspread.service')

const GSPREAD_ID_CORE = "17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek",
GSPREAD_ID_FOOD_COUNT = '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM',
ACTIVE_STATE_LIST = ['inactive','active'];

const NightMarketDataService = {
    appendFoodCount:async (rows)=>{
        // the current year's sheet name
        const currentYearSheet = `inventory ${(new Date()).getFullYear()}` 

        // we create a new sheet every year, so we test if the sheet exists
        if(!(await GSpreadService.sheetExists(currentYearSheet,GSPREAD_ID_FOOD_COUNT))){
            // create it if not
            await GSpreadService.sheetCreate(currentYearSheet,GSPREAD_ID_FOOD_COUNT)
        }

        return GSpreadService.rowsAppend(rows,currentYearSheet,GSPREAD_ID_FOOD_COUNT)
    },
    getOrgNameList:async (filter='')=>{
        let list =  GSpreadService.rangeGet("Org!B2:B",GSPREAD_ID_CORE)
        // get rid of blanks
        .then(a => a.filter(a => a[0].trim()))

        if(filter){
            const searcher = new FuzzySearch(people, [], {
                caseSensitive: false,
                // sort by best match
                sort:true
              });
              list = searcher.search(f);
        }
        return list
    },
    getPersonNameList:async ()=>{
        return GSpreadService.rangeGet("Person!B2:B",GSPREAD_ID_CORE)
    // get rid of blanks
    .then(a => a.filter(a => a[0].trim()))
    },
    // TODO:
    // toggle a person state to active
    setPersonActiveState:async (email,activeState)=>{
        if(!ACTIVE_STATE_LIST.indexOf(activeState)){
            throw new Error('Must set active state')
        }
        // TODO:
       // get all the person rows
       // find a match to email
       // update cell for active at row and column index (add method to GSpreadService)
    },
    // toggle an org state to active
    setOrgActiveState:async (name,activeState)=>{
        if(!ACTIVE_STATE_LIST.indexOf(activeState)){
            throw new Error('Must set active state')
        }
        // TODO:
       // get all the org rows
       // find a match to name
       // update cell for active at row and column index (add method to GSpreadService)
    }

}

module.exports = NightMarketDataService ;

