// this is not a test, it's a module so we can test cache across modules

import { CacheService } from '../src/service';
export const TestCache = CacheService<{ some: string }>('food-count');

export const TEST_CACHE_STRING = 'other data';
TestCache.add('test-module', { some: TEST_CACHE_STRING });
