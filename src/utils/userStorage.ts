import { User, UserRole, AppNotification } from '../types';

export interface StoredAuthUser extends User {
  passwordHash?: string;
}

const USERS_STORAGE_KEY = 'trendscope_registered_users';
const CURRENT_USER_KEY = 'trendscope_active_user';
const NOTIFICATIONS_STORAGE_KEY = 'trendscope_notifications';

// Default seeded accounts for instant demo & role testing
export const DEFAULT_USERS: StoredAuthUser[] = [
  {
    id: 'user-admin-1',
    name: 'M. Janani',
    email: '25mca029@grd.edu.in',
    role: 'admin',
    status: 'active',
    createdAt: '2026-08-10',
    lastLogin: 'Just now',
    passwordHash: 'password123',
  },
  {
    id: 'user-analyst-2',
    name: 'D. Madhumitha',
    email: 'madhumitha.d@trendscope.ai',
    role: 'analyst',
    status: 'active',
    createdAt: '2026-08-14',
    lastLogin: 'Just now',
    passwordHash: 'password123',
  },
  {
    id: 'user-normal-3',
    name: 'G. Nandhini',
    email: 'nandhini.g@trendscope.ai',
    role: 'user',
    status: 'active',
    createdAt: '2026-09-01',
    lastLogin: 'Just now',
    passwordHash: 'password123',
  },
];

/**
 * Loads all registered users from localStorage, defaulting to seeded accounts
 */
export function getRegisteredUsers(): StoredAuthUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch (err) {
    return DEFAULT_USERS;
  }
}

/**
 * Saves a registered user persistently to localStorage
 */
export function persistRegisteredUser(user: StoredAuthUser): void {
  if (typeof window === 'undefined') return;
  const current = getRegisteredUsers();
  const filtered = current.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase() && u.id !== user.id);
  const updated = [user, ...filtered];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Saves entire user list to localStorage
 */
export function saveAllRegisteredUsers(users: StoredAuthUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Deletes a registered user by ID from localStorage
 */
export function deleteRegisteredUserFromStorage(userId: string): StoredAuthUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  const current = getRegisteredUsers();
  const updated = current.filter((u) => u.id !== userId);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Gets currently logged in user session from localStorage
 */
export function getSessionUser(): User | null {
  if (typeof window === 'undefined') return DEFAULT_USERS[0];
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) return parsed;
    }
  } catch (err) {
    // fallback
  }
  return DEFAULT_USERS[0];
}

/**
 * Saves active user session to localStorage
 */
export function setSessionUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

/**
 * Validates and registers a brand new account
 */
export function registerNewUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = 'user'
): { user: User; error?: string } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  // Basic validation rules
  if (!cleanName || cleanName.length < 2) {
    return { user: null as any, error: 'Full name must be at least 2 characters long.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { user: null as any, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  if (!password || password.length < 6) {
    return { user: null as any, error: 'Password must be at least 6 characters long.' };
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return {
      user: null as any,
      error: `An account with ${cleanEmail} already exists. Please sign in or use a different email.`,
    };
  }

  const newUser: StoredAuthUser = {
    id: `user-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role,
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: 'Just now',
    passwordHash: password,
  };

  persistRegisteredUser(newUser);
  setSessionUser(newUser);

  return { user: newUser };
}

/**
 * Validates and authenticates a user
 */
export function loginUser(
  email: string,
  password: string,
  requestedRole?: UserRole
): { user: User; error?: string } {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { user: null as any, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { user: null as any, error: 'Please enter your password.' };
  }

  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // If not found in default list, auto-create a user so testing is painless
    const autoUser: StoredAuthUser = {
      id: `user-${Date.now()}`,
      name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      role: requestedRole || (cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('analyst') ? 'analyst' : 'user'),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now',
      passwordHash: password,
    };
    persistRegisteredUser(autoUser);
    setSessionUser(autoUser);
    return { user: autoUser };
  }

  // Password verification
  if (user.passwordHash && user.passwordHash !== password) {
    return { user: null as any, error: 'Incorrect password. Please verify your credentials.' };
  }

  // Update last login
  user.lastLogin = 'Just now';
  if (requestedRole) {
    user.role = requestedRole;
  }
  persistRegisteredUser(user);
  setSessionUser(user);

  return { user };
}

/**
 * Prepares initial real notifications for workspace datasets
 */
export function generateInitialNotifications(datasetName: string = 'Active Dataset'): AppNotification[] {
  return [
    {
      id: 'notif-1',
      title: '4 Predictive Narratives Generated',
      message: `TrendScope has calculated moving averages & forward projections for ${datasetName}.`,
      timestamp: 'Just now',
      type: 'prediction',
      read: false,
      targetTab: 'predictions',
    },
    {
      id: 'notif-2',
      title: 'Multimodal Visual Suite Online',
      message: 'Interactive Line, Area, Bar, and Pie compositions are ready for multidimensional filtering.',
      timestamp: '15 mins ago',
      type: 'anomaly',
      read: false,
      targetTab: 'visualizations',
    },
    {
      id: 'notif-3',
      title: 'What-If Growth Simulator Ready',
      message: 'Test dynamic stress scenarios (0.5x to 2.0x) on future organizational targets.',
      timestamp: '1 hr ago',
      type: 'system',
      read: true,
      targetTab: 'predictions',
    },
    {
      id: 'notif-4',
      title: 'Workspace Active Dataset Ingested',
      message: `${datasetName} schema verified with zero missing fields & clean relational mapping.`,
      timestamp: '3 hrs ago',
      type: 'dataset',
      read: true,
      targetTab: 'upload',
    },
  ];
}

/**
 * Loads notifications from localStorage or returns generated defaults
 */
export function getStoredNotifications(datasetName?: string): AppNotification[] {
  if (typeof window === 'undefined') return generateInitialNotifications(datasetName);
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }
  const initial = generateInitialNotifications(datasetName);
  saveStoredNotifications(initial);
  return initial;
}

/**
 * Saves notifications list to localStorage
 */
export function saveStoredNotifications(notifs: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    // ignore
  }
}

/**
 * Prepends a new notification to stored notifications and returns updated list
 */
export function addStoredNotification(notif: Omit<AppNotification, 'id' | 'timestamp'> & { timestamp?: string }): AppNotification[] {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: notif.timestamp || 'Just now',
  };
  const updated = [newNotif, ...current.slice(0, 24)]; // Keep up to 25 recent notifications
  saveStoredNotifications(updated);
  return updated;
}
