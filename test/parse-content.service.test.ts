import { describe, expect, test } from '@jest/globals';
import { ParseContentService } from '../src/lib';

describe('ParseContentService', () => {
    test('getting the right date format', async () => {
        const a = ParseContentService.dateFormat(
            new Date('July 21, 1983 01:15:00')
        );

        expect(a).toBe('7/21/1983');
    });

    test('getting the most recent date from a day name', async () => {
        const a = ParseContentService.getDateStringFromDay('monday');
        expect(new Date(a).getDay()).toBe(
            // a known monday
            new Date('February 27, 2023').getDay()
        );
    });

    test('getting the number and string from content', async () => {
        let a = ParseContentService.getLbsAndString('8 lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = ParseContentService.getLbsAndString('8 Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = ParseContentService.getLbsAndString('8lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = ParseContentService.getLbsAndString('Village Bakery  8lbs ');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = ParseContentService.getLbsAndString('Village Bakery  8 pounds ');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = ParseContentService.getLbsAndString('Village Bakery');
        expect(a[0]).toBe(0);
        expect(a[1]).toBe('Village Bakery');

        a = ParseContentService.getLbsAndString('');
        expect(a[0]).toBe(0);
        expect(a[1]).toBe('');
    });
});
