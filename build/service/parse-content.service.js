"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseContentService = void 0;
// so the idea of this service is that we might want a single utility for methods that
// parse content (messages) that come from discord. This is a general parser that
// gets and gives strings that are not nm related, but are utility
class ParseContentService {
    static dateFormat(date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    static getEmail(emailFuzzy) {
        const email = emailFuzzy
            .trim()
            .split(' ')
            .find((a) => a.split('@').length === 2);
        if (!email) {
            return '';
        }
        return email;
    }
}
exports.ParseContentService = ParseContentService;
