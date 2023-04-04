export class ParseContentService {
    static dateFormat(date: Date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
}
