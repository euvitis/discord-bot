import { describe, expect, test } from '@jest/globals';
import { MessageService } from '../src/service';

const messageInit = {
    FOODCOUNT_INSERT: {
        lbs: '10'
    },
    FOODCOUNT_INPUT_OK: {
        date: ''
    }
};

describe('MessageService', () => {
    test('gets a single message', () => {
        const a = MessageService.loadMessage(
            Object.keys(messageInit).pop() as string
        );
        expect(a.length).toBeGreaterThan(3);
    });

    test('gets a set of messages', () => {
        const a = MessageService.loadAllMessage(Object.keys(messageInit));
        expect(!a.FOODCOUNT_INSERT).toBeFalsy();
    });

    test('gets a message map', () => {
        const a = MessageService.createMap(messageInit);

        expect(typeof a.FOODCOUNT_INSERT({ lbs: '' })).toBe('string');
        expect(typeof a.FOODCOUNT_INPUT_OK({ date: '' })).toBe('string');
        const b = a.FOODCOUNT_INSERT({ lbs: '20' });
        expect(b.split('\n')[1]).toBe(`20 lbs  from  on .`);
    });
});
