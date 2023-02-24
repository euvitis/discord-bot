import { describe, expect, test } from '@jest/globals';
import { NightMarketDataService } from './night-market-data.service';

describe('NightMarketDataService', () => {
  test('gets the list of orgs from central spreadsheet', async () => {
    const orgList = await NightMarketDataService.getOrgNameList();
    expect(orgList.length).toBeGreaterThan(0);
  });
});
