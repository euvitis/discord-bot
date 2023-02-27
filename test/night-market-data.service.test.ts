import { describe, expect, test } from '@jest/globals';
import {
    setPersonActiveState,
    getOrgNameList
} from '../src/lib/night-market-data.service';

describe('NightMarketDataService', () => {
    test('update a person active status in central spreadsheet', async () => {
        // await NightMarketDataService.setPersonActiveState(
        //   'christianco@gmail.com',
        //   'active'
        // );
        const a = await setPersonActiveState('christianco@gmail.com', 'active');

        expect(a).toBe('person!A35');
    });

    test('gets the list of orgs from central spreadsheet', async () => {
        const orgList = await getOrgNameList();
        expect(orgList.length).toBeGreaterThan(0);
        // TODO: we can test this once we have a delete row functionality
        // await NightMarketDataService.appendFoodCount([['hi', 'there']]);
    });
});
