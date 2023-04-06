// TODO: this can be merged with nm-config.service
// the main difference is that is an async wrapper for secrets manager
// while these config aren't secret, but there is no reason not to
// roll them together I don't think - keeps it simple

// right now dev and test are the same
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
    // these point to TEST data in night-tech folder
    test: {
        GSPREAD_CORE_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
        GSPREAD_INVENTORY_ID: '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
    },
    prod: {
        GSPREAD_CORE_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
        GSPREAD_INVENTORY_ID: '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
    }
};
if (!EnvConfig[process.env.NODE_ENV as Env]) {
    console.log('No NODE_ENV set, default to test');
}
const env = (process.env.NODE_ENV || 'dev') as Env;
console.log(env);
export const Config = () => EnvConfig[env];
