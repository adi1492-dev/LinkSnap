import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

function generateApiKey() {
  return 'pk_' + generateId().replace(/-/g, '') + generateId().replace(/-/g, '');
}

export interface PreviewData {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  domain: string | null;
  favicon: string | null;
  type: string | null;
  siteName: string | null;
  locale: string | null;
  articlePublishedTime: string | null;
  articleModifiedTime: string | null;
  articleAuthor: string | null;
  twitterCard: string | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  themeColor: string | null;
  keywords: string[] | null;
}

export interface HistoryItem {
  id: string;
  url: string;
  data: PreviewData;
  timestamp: number;
  collection: string | null;
  tags: string[];
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: number;
  requestsCount: number;
  userId: string;
  allowedOrigins: string[];
}

export interface ApiLog {
  id: string;
  userId: string;
  apiKey: string;
  keyName: string;
  url: string;
  timestamp: number;
  status: number;
  responseTime: number;
  method: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  quotaLimit: number;
}

interface AppState {
  history: HistoryItem[];
  apiKeys: ApiKey[];
  users: User[];
  currentUser: User | null;
  activeUserPasswordMap: Record<string, string>; // Local safe password persistence simulation
  apiLogs: ApiLog[];
  
  // Existing features
  addToHistory: (url: string, data: PreviewData) => void;
  removeFromHistory: (id: string) => void;
  updateHistoryItem: (id: string, collection: string | null, tags: string[]) => void;
  
  // Auth Features
  registerUser: (name: string, email: string, checkPassword: string) => { success: boolean; error?: string };
  loginUser: (email: string, checkPassword: string) => { success: boolean; error?: string };
  logoutUser: () => void;
  
  // API Management Features
  createApiKey: (name: string) => void;
  deleteApiKey: (id: string) => void;
  incrementUsage: (keyId: string) => void;
  addApiLog: (log: Omit<ApiLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      history: [],
      apiKeys: [],
      users: [],
      currentUser: null,
      activeUserPasswordMap: {},
      apiLogs: [],
      
      addToHistory: (url, data) => set((state) => {
        const existing = state.history.find(h => h.url === url);
        if (existing) {
          return state;
        }
        const newItem: HistoryItem = {
          id: generateId(),
          url,
          data,
          timestamp: Date.now(),
          collection: null,
          tags: []
        };
        return { history: [newItem, ...state.history] };
      }),
      
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),

      updateHistoryItem: (id, collection, tags) => set((state) => ({
        history: state.history.map(h => h.id === id ? { ...h, collection, tags } : h)
      })),

      // Register User
      registerUser: (name, email, checkPassword) => {
        const state = get();
        const trimmedEmail = email.trim().toLowerCase();
        
        if (!name.trim() || !trimmedEmail || !checkPassword) {
          return { success: false, error: 'All fields are required.' };
        }
        
        const existingUser = state.users.find(u => u.email === trimmedEmail);
        if (existingUser) {
          return { success: false, error: 'User with this email already exists.' };
        }
        
        const newUser: User = {
          id: generateId(),
          name: name.trim(),
          email: trimmedEmail,
          createdAt: Date.now(),
          quotaLimit: 100 // Default free request quota
        };
        
        set((state) => ({
          users: [...state.users, newUser],
          activeUserPasswordMap: {
            ...state.activeUserPasswordMap,
            [trimmedEmail]: checkPassword
          },
          currentUser: newUser
        }));
        
        // Auto create a default api key for convenience
        const userStore = get();
        userStore.createApiKey('Default Development Key');
        
        return { success: true };
      },

      // Login User
      loginUser: (email, checkPassword) => {
        const state = get();
        const trimmedEmail = email.trim().toLowerCase();
        
        const user = state.users.find(u => u.email === trimmedEmail);
        const storedPassword = state.activeUserPasswordMap[trimmedEmail];
        
        if (!user || storedPassword !== checkPassword) {
          return { success: false, error: 'Invalid email or password.' };
        }
        
        set({ currentUser: user });
        return { success: true };
      },

      // Logout User
      logoutUser: () => {
        set({ currentUser: null });
      },

      // API Key Management mapped to User ID
      createApiKey: (name) => set((state) => {
        const currentUserId = state.currentUser?.id || 'guest';
        
        const newKey: ApiKey = {
          id: generateId(),
          key: generateApiKey(),
          name: name.trim() || 'Development Key',
          createdAt: Date.now(),
          requestsCount: 0,
          userId: currentUserId,
          allowedOrigins: ['*']
        };
        
        return {
          apiKeys: [...state.apiKeys, newKey]
        };
      }),

      deleteApiKey: (id) => set((state) => ({
        apiKeys: state.apiKeys.filter(k => k.id !== id)
      })),

      incrementUsage: (keyId) => set((state) => ({
        apiKeys: state.apiKeys.map(k => k.id === keyId ? { ...k, requestsCount: k.requestsCount + 1 } : k)
      })),

      addApiLog: (log) => set((state) => {
        const newLog: ApiLog = {
          ...log,
          id: generateId(),
          timestamp: Date.now()
        };
        // Keep last 150 logs to avoid bloating localstorage
        const currentLogs = [newLog, ...state.apiLogs].slice(0, 150);
        return { apiLogs: currentLogs };
      }),

      clearLogs: () => set((state) => ({
        apiLogs: state.apiLogs.filter(l => l.userId !== (state.currentUser?.id || 'guest'))
      }))
    }),
    {
      name: 'link-preview-storage-v2',
    }
  )
);
