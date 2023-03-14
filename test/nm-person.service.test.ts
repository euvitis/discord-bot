import { describe, expect, test, jest } from '@jest/globals';

import { PersonService } from '../src/service/nm-person.service';

jest.setTimeout(20000);

describe('nm-person.service', () => {
    test('make sure we can get a column range', async () => {
        expect(PersonService.getColumnRangeName('DISCORD_ID')).toBe('person!A');
        expect(PersonService.getColumnRangeName('STATUS', 3)).toBe('person!B3');
        expect(PersonService.getColumnRangeName('EMAIL')).toBe('person!D');
        expect(PersonService.getColumnRangeName('EMAIL', 1, 'F')).toBe(
            'person!D1:F'
        );
    });
});
