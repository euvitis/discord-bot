import Debug from 'debug';
export const DebugService = (id) => Debug(`nm:${id}`);
// smaller util!
export const Dbg = DebugService;
