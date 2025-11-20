'use client';

const GUEST_LIMIT_KEY = 'echobottle_guest_limit';
const GUEST_ACTIONS_KEY = 'echobottle_guest_actions';

export interface GuestAction {
  type: 'throw' | 'catch';
  timestamp: number;
  date: string; // YYYY-MM-DD format for daily reset
}

export interface GuestStatus {
  isGuest: boolean;
  throwActionsRemaining: number;
  catchActionsRemaining: number;
  totalThrowActions: number;
  totalCatchActions: number;
  hasReachedThrowLimit: boolean;
  hasReachedCatchLimit: boolean;
  hasReachedAnyLimit: boolean;
}

export const GUEST_THROW_LIMIT = 3; // Throw actions allowed per day
export const GUEST_CATCH_LIMIT = 3; // Catch actions allowed per day

/**
 * Get today's date string (YYYY-MM-DD) for daily reset
 */
const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Filter actions for today only
 */
const getTodayActions = (actions: GuestAction[]): GuestAction[] => {
  const today = getTodayDate();
  return actions.filter(action => action.date === today);
};

/**
 * Get guest status - how many actions remaining for throw and catch separately
 */
export const getGuestStatus = (): GuestStatus => {
  if (typeof window === 'undefined') {
    return { 
      isGuest: false, 
      throwActionsRemaining: 0, 
      catchActionsRemaining: 0,
      totalThrowActions: 0,
      totalCatchActions: 0,
      hasReachedThrowLimit: false,
      hasReachedCatchLimit: false,
      hasReachedAnyLimit: false
    };
  }

  try {
    const actionsJson = localStorage.getItem(GUEST_ACTIONS_KEY);
    const allActions: GuestAction[] = actionsJson ? JSON.parse(actionsJson) : [];
    
    // Filter to today's actions only (daily reset)
    const todayActions = getTodayActions(allActions);
    
    const throwActions = todayActions.filter(a => a.type === 'throw');
    const catchActions = todayActions.filter(a => a.type === 'catch');
    
    const totalThrowActions = throwActions.length;
    const totalCatchActions = catchActions.length;
    
    const throwActionsRemaining = Math.max(0, GUEST_THROW_LIMIT - totalThrowActions);
    const catchActionsRemaining = Math.max(0, GUEST_CATCH_LIMIT - totalCatchActions);
    
    const hasReachedThrowLimit = totalThrowActions >= GUEST_THROW_LIMIT;
    const hasReachedCatchLimit = totalCatchActions >= GUEST_CATCH_LIMIT;
    const hasReachedAnyLimit = hasReachedThrowLimit || hasReachedCatchLimit;

    return {
      isGuest: true, // We'll check if user is authenticated separately
      throwActionsRemaining,
      catchActionsRemaining,
      totalThrowActions,
      totalCatchActions,
      hasReachedThrowLimit,
      hasReachedCatchLimit,
      hasReachedAnyLimit,
    };
  } catch (e) {
    console.error('Error reading guest status:', e);
    return { 
      isGuest: true, 
      throwActionsRemaining: GUEST_THROW_LIMIT, 
      catchActionsRemaining: GUEST_CATCH_LIMIT,
      totalThrowActions: 0,
      totalCatchActions: 0,
      hasReachedThrowLimit: false,
      hasReachedCatchLimit: false,
      hasReachedAnyLimit: false
    };
  }
};

/**
 * Check if guest can perform a throw action
 */
export const canGuestThrow = (): boolean => {
  const status = getGuestStatus();
  return !status.hasReachedThrowLimit;
};

/**
 * Check if guest can perform a catch action
 */
export const canGuestCatch = (): boolean => {
  const status = getGuestStatus();
  return !status.hasReachedCatchLimit;
};

/**
 * Check if guest can perform any action (backward compatibility)
 */
export const canGuestPerformAction = (type?: 'throw' | 'catch'): boolean => {
  if (type === 'throw') {
    return canGuestThrow();
  } else if (type === 'catch') {
    return canGuestCatch();
  }
  // Default: check both limits
  const status = getGuestStatus();
  return !status.hasReachedAnyLimit;
};

/**
 * Record a guest action (throw or catch) - daily reset
 */
export const recordGuestAction = (type: 'throw' | 'catch'): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const actionsJson = localStorage.getItem(GUEST_ACTIONS_KEY);
    const allActions: GuestAction[] = actionsJson ? JSON.parse(actionsJson) : [];
    
    // Clean up old actions (older than today) - daily reset
    const today = getTodayDate();
    const recentActions = allActions.filter(a => a.date === today);
    
    // Check if limit reached for this specific action type
    const typeActions = recentActions.filter(a => a.type === type);
    const limit = type === 'throw' ? GUEST_THROW_LIMIT : GUEST_CATCH_LIMIT;
    
    if (typeActions.length >= limit) {
      return false;
    }

    // Add new action with today's date
    const newActions = [...recentActions, {
      type,
      timestamp: Date.now(),
      date: today,
    }];

    localStorage.setItem(GUEST_ACTIONS_KEY, JSON.stringify(newActions));
    
    // Dispatch custom event to notify other components of the change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('echobottle_guest_action'));
    }
    
    return true;
  } catch (e) {
    console.error('Error recording guest action:', e);
    return false;
  }
};

/**
 * Clear guest actions (called when user signs in)
 */
export const clearGuestActions = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(GUEST_ACTIONS_KEY);
    localStorage.removeItem(GUEST_LIMIT_KEY);
  } catch (e) {
    console.error('Error clearing guest actions:', e);
  }
};

/**
 * Get guest throw actions count for today
 */
export const getGuestThrowCount = (): number => {
  const status = getGuestStatus();
  return status.totalThrowActions;
};

/**
 * Get guest catch actions count for today
 */
export const getGuestCatchCount = (): number => {
  const status = getGuestStatus();
  return status.totalCatchActions;
};

