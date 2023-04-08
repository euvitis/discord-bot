import { describe, expect, test, jest } from '@jest/globals';
import { NmOrgService } from '../src/nm-service';

jest.setTimeout(20000);

describe('NightMarketDataService', () => {
    test('gets the list of orgs from central spreadsheet', async () => {
        const orgList = await NmOrgService.getOrgNameList({});
        expect(orgList.length).toBeGreaterThan(3);
    });
});
