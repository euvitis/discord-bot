import { ActiveStateType } from './model/night-market.model';

/**
 * CORE DATA
 */

// across our data model, these strings are used to identify if a resource is active or not
export const GSPREAD_CORE_ACTIVE_STATE_LIST: ActiveStateType[] = [
    'active',
    'inactive'
];
