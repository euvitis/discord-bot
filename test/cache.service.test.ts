import { describe, expect, test } from '@jest/globals';
import { CacheService } from '../src/service';
import { TestCache, TEST_CACHE_STRING } from './cache.trial';

describe('CacheService', () => {
    test('make sure our cache payload works', () => {
        const payloadA = { some: 'data' };

        const a = CacheService<{ some: string }>('food-count');
        a.add('test', payloadA);

        const b = CacheService<{ some: string }>('food-count');
        const t = b.get('test');
        // todo: move this to gspread test
        expect(t?.some).toBe(payloadA.some);
    });

    test('make sure our cache payload works across modules', () => {
        const a = CacheService<{ some: string }>('food-count');

        const t = TestCache.get('test-module');
        expect(t?.some).toBe(TEST_CACHE_STRING);

        const u = a.get('test-module');
        expect(u?.some).toBe(TEST_CACHE_STRING);
    });
});
