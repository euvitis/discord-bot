type Env = 'dev' | 'test' | 'prod';

interface Config {
    // the  spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_ID: string;
    // the  spreadsheet id for where food counts are kept
    GSPREAD_INVENTORY_ID: string;
}

const EnvConfig: {
    [k in Env]: Config;
} = {
    dev: {
        GSPREAD_CORE_ID: '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek',
        GSPREAD_INVENTORY_ID: '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM'
    },
    test: {
        GSPREAD_CORE_ID: '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek',
        GSPREAD_INVENTORY_ID: '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM'
    },
    prod: {
        GSPREAD_CORE_ID: '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek',
        GSPREAD_INVENTORY_ID: '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM'
    }
};
if (!EnvConfig[process.env.NODE_ENV as Env]) {
    console.log('No NODE_ENV set, default to test');
}
const env = (process.env.NODE_ENV || 'dev') as Env;
console.log(env);
export const Config = () => EnvConfig[env];
