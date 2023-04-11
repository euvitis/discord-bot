"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const debug_service_1 = require("./debug.service");
const handlebars_1 = __importDefault(require("handlebars"));
const dbg = (0, debug_service_1.Dbg)('MessageService');
const messageCache = {};
const messagePath = (0, path_1.join)(__dirname, '/../message-md');
class MessageService {
    static loadMessage(id, reload = false) {
        if (messageCache[id] && !reload) {
            return messageCache[id];
        }
        try {
            // todo, we want to process with markdown
            messageCache[id] = (0, fs_1.readFileSync)((0, path_1.join)(messagePath, id + '.md'), 'utf-8');
        }
        catch (e) {
            // todo: set up a proper logger and send notifications in prod
            if (process.env.NODE_ENV === 'prod') {
                console.error(e);
            }
            else {
                dbg(e);
            }
        }
        return messageCache[id];
    }
    static loadAllMessage(a, reload = false) {
        let c = {};
        try {
            for (const b of a) {
                c[b] = this.loadMessage(b, reload);
            }
        }
        catch (e) {
            dbg(e);
        }
        return c;
    }
    static createMap(map) {
        const messageMap = MessageService.loadAllMessage(Object.keys(map));
        // todo: parse with HBS
        return Object.keys(messageMap).reduce((a, b) => {
            const d = handlebars_1.default.compile(messageMap[b]);
            a[b] = (c) => d(Object.assign(Object.assign({}, map[b]), c));
            return a;
        }, {});
    }
}
exports.MessageService = MessageService;
