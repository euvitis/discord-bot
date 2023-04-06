"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const EnvConfig = {
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
if (!EnvConfig[process.env.NODE_ENV]) {
    console.log('No NODE_ENV set, default to test');
}
const env = (process.env.NODE_ENV || 'dev');
console.log(env);
const Config = () => EnvConfig[env];
exports.Config = Config;
