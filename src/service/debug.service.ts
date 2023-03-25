import Debug from 'debug';
export const DebugService = (id: string) => Debug(`nm:${id}`);
// smaller util!
export const Dbg = DebugService;
