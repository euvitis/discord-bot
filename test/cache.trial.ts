import { CacheService } from '../src/service';
export const TestCache = CacheService<{ some: string }>('food-count');

export const TEST_CACHE_STRING = 'other data';
TestCache.add('test-module', { some: TEST_CACHE_STRING });
