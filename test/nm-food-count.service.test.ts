import { describe, expect, test } from '@jest/globals';
import { ParseContentService } from '../src/service';
import { NmFoodCountService } from '../src/service';

describe('NmFoodCountService', () => {
    test('getting a list of parsed data from a content', async () => {
        const [date, listOk, listFail] =
            await NmFoodCountService.getFoodCountDateAndParsedInput(`
3/27
4 vb
1 DCM
4 fire
4 fw
2 odd fellws
6 dfc
student farm
`);

        expect(date).toBe('3/27/2023');
        expect(listOk.length).toBe(6);

        const [village, dcm, fire, fw, oddf, dfc] = listOk;
        expect(village.org).toBe('Village Bakery');
        expect(dcm.org).toBe('Davis Community Meals');
        expect(fire.org).toBe('Fire Wings');
        expect(fw.org).toBe('Fire Wings');
        expect(oddf.org).toBe("Odd Fellow's Hall");
        expect(dfc.org).toBe('Davis Food Co-op');

        expect(listFail.length).toBe(1);
    });

    test('getting the right date format', async () => {
        const a = ParseContentService.dateFormat(
            new Date('July 21, 1983 01:15:00')
        );

        expect(a).toBe('7/21/1983');
    });

    test('getting the most recent date from a day name', async () => {
        const a = NmFoodCountService.getDateStringFromDay('monday');
        expect(new Date(a).getDay()).toBe(
            // a known monday
            new Date('February 27, 2023').getDay()
        );
    });

    test('getting the number and string from content', async () => {
        let a = NmFoodCountService.getLbsAndString('8 lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = NmFoodCountService.getLbsAndString('8 Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = NmFoodCountService.getLbsAndString('8lbs Village Bakery');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = NmFoodCountService.getLbsAndString('Village Bakery  8lbs ');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = NmFoodCountService.getLbsAndString('Village Bakery  8 pounds ');
        expect(a[0]).toBe(8);
        expect(a[1]).toBe('Village Bakery');

        a = NmFoodCountService.getLbsAndString('Village Bakery');
        expect(a[0]).toBe(0);
        expect(a[1]).toBe('Village Bakery');

        a = NmFoodCountService.getLbsAndString('');
        expect(a[0]).toBe(0);
        expect(a[1]).toBe('');
    });
});
