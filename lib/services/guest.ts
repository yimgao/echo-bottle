'use client';

const GUEST_LIMIT_KEY = 'echobottle_guest_limit';
const GUEST_ACTIONS_KEY = 'echobottle_guest_actions';

export interface GuestAction {
  type: 'throw' | 'catch';
  timestamp: number;
  date: string;
}

export interface GuestStatus {
  isGuest: boolean;
  actionsRemaining: number;
  totalActions: number;
  hasReachedLimit: boolean;
}

export const GUEST_DAILY_LIMIT = 3;

const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getTodayActions = (actions: GuestAction[]): GuestAction[] => {
  const today = getTodayDate();
  return actions.filter(action => action.date === today);
};

export const getGuestStatus = (): GuestStatus => {
  if (typeof window === 'undefined') {
    return { 
      isGuest: false, 
      actionsRemaining: 0,
      totalActions: 0,
      hasReachedLimit: false
    };
  }

  try {
    const actionsJson = localStorage.getItem(GUEST_ACTIONS_KEY);
    const allActions: GuestAction[] = actionsJson ? JSON.parse(actionsJson) : [];
    
    const todayActions = getTodayActions(allActions);
    const totalActions = todayActions.length;
    
    const actionsRemaining = Math.max(0, GUEST_DAILY_LIMIT - totalActions);
    const hasReachedLimit = totalActions >= GUEST_DAILY_LIMIT;

    return {
      isGuest: true,
      actionsRemaining,
      totalActions,
      hasReachedLimit,
    };
  } catch (e) {
    console.error('Error reading guest status:', e);
    return { 
      isGuest: true, 
      actionsRemaining: GUEST_DAILY_LIMIT,
      totalActions: 0,
      hasReachedLimit: false
    };
  }
};

export const canGuestPerformAction = (): boolean => {
  const status = getGuestStatus();
  return !status.hasReachedLimit;
};

export const canGuestThrow = (): boolean => canGuestPerformAction();

export const canGuestCatch = (): boolean => canGuestPerformAction();

export const recordGuestAction = (type: 'throw' | 'catch'): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const actionsJson = localStorage.getItem(GUEST_ACTIONS_KEY);
    const allActions: GuestAction[] = actionsJson ? JSON.parse(actionsJson) : [];
    
    const today = getTodayDate();
    const recentActions = allActions.filter(a => a.date === today);
    
    if (recentActions.length >= GUEST_DAILY_LIMIT) {
      return false;
    }

    const newActions = [...recentActions, {
      type,
      timestamp: Date.now(),
      date: today,
    }];

    localStorage.setItem(GUEST_ACTIONS_KEY, JSON.stringify(newActions));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('echobottle_guest_action'));
    }
    
    return true;
  } catch (e) {
    console.error('Error recording guest action:', e);
    return false;
  }
};

export const clearGuestActions = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(GUEST_ACTIONS_KEY);
    localStorage.removeItem(GUEST_LIMIT_KEY);
  } catch (e) {
    console.error('Error clearing guest actions:', e);
  }
};

