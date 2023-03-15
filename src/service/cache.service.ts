// we type our cache strings to make autocomplete work across cache imports
// todo: add more cache types as needed
type CacheType = 'food-count';

type PayloadBaseModel = {
    stamp: number;
};

type PayloadModel = {
    [k in string]: any;
};

// a basic object map for named caches
type CachePayloadModel<
    U extends PayloadModel & {
        stamp: number;
    }
> = {
    [k in string]: U;
};

type CacheModel<U extends PayloadModel = PayloadModel> = {
    [k in CacheType]: CachePayloadModel<U & PayloadBaseModel>;
};

// the private cache
const Cache: CacheModel<PayloadModel> = {
    'food-count': {}
};

// todo: we should probably delete any cached data that is too old once per day

// a model is passed to cache service which types that cache
export function CacheService<U extends PayloadModel = PayloadModel>(
    name: CacheType
): {
    add: (id: string, payload: U) => U;
    update: (id: string, payload: Partial<U>) => U | void;
    get: (id: string) => U | void;
    delete: (id: string) => void;
} {
    const C = Cache[name] as CachePayloadModel<U & PayloadBaseModel>;

    return {
        add: (id: string, payload: U): U => {
            Cache[name][id] = { ...payload, stamp: Date.now() };
            return payload;
        },
        get: (id: string): U => {
            return C[id];
        },
        update: (id, payload: Partial<U>) => {
            if (C && C[id]) {
                return (C[id] = {
                    ...C[id],
                    ...payload
                });
            }
            return;
        },
        delete: (id: string): void => {
            if (C[id]) {
                delete C[id];
            }
        }
    };
}
