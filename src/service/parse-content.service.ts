// so the idea of this service is that we might want a single utility for methods that
// parse content (messages) that come from discord. Right now it is just keeping our date formatter.

export class ParseContentService {
    static dateFormat(date: Date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
}
