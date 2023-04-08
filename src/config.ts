// TODO: this can be merged with nm-config.service
// the main difference is that is an async wrapper for secrets manager
// while these config aren't secret, but there is no reason not to
// roll them together I don't think - keeps it simple

// right now dev and test are the same
type EnvType = 'dev' | 'test' | 'prod';

interface Config {
    // the  spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_ID: string;
    // the  spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;
}

const EnvConfig: {
    [k in EnvType]: Config;
} = {
    dev: {
        GSPREAD_CORE_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
        GSPREAD_FOODCOUNT_ID: '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
    },
    // these point to TEST data in night-tech folder
    test: {
        GSPREAD_CORE_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
        GSPREAD_FOODCOUNT_ID: '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
    },
    prod: {
        GSPREAD_CORE_ID: '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek',
        GSPREAD_FOODCOUNT_ID: '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM'
    }
};
if (!EnvConfig[process.env.NODE_ENV as EnvType]) {
    console.log('No NODE_ENV set, default to test');
}
export const Config = (
    // allow env to be passed so we can test config in any env
    env = (process.env.NODE_ENV || 'test') as EnvType
) => EnvConfig[env];
