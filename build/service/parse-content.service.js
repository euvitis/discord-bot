"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseContentService = void 0;
class ParseContentService {
    static dateFormat(date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
}
exports.ParseContentService = ParseContentService;
