"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
// the private cache
const Cache = {
    'food-count': {}
};
// todo: we should probably delete any cached data that is too old once per day
// a model is passed to cache service which types that cache
function CacheService(name) {
    const C = Cache[name];
    return {
        add: (id, payload) => {
            Cache[name][id] = Object.assign(Object.assign({}, payload), { stamp: Date.now() });
            return payload;
        },
        get: (id) => {
            return C[id];
        },
        update: (id, payload) => {
            if (C && C[id]) {
                return (C[id] = Object.assign(Object.assign({}, C[id]), payload));
            }
            return;
        },
        delete: (id) => {
            if (C[id]) {
                delete C[id];
            }
        }
    };
}
exports.CacheService = CacheService;
