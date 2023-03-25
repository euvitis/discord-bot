import { describe, expect, test, jest } from '@jest/globals';
import { GoogleSecretService } from '../src/service/google-secrets.service';
import { NmConfigService } from '../src/service/nm-config.service';

jest.setTimeout(1000000);

describe('nm-config.service.ts', () => {
    // to run this, set the NODE_ENV to prod when running Jest
    // and make sure you are using a service account with secrets access
    if (process.env.NODE_ENV === 'prod') {
        test('make sure our GoogleSecretService function works', async () => {
            const a = await GoogleSecretService.getParsed<{ hi: string }>(
                'nm-config-test-api'
            );
            expect(a.hi).toBe('there');
        });
    } else {
        test('make sure our NmConfigService works locally', async () => {
            const a = await NmConfigService.getParsed();
            expect(Object.keys(a).length).toBe(2);
        });
    }
});
