import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
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
  currentUser: User | null;
  apiLogs: ApiLog[];
  
  // History features (remains in localStorage)
  addToHistory: (url: string, data: PreviewData) => void;
  removeFromHistory: (id: string) => void;
  updateHistoryItem: (id: string, collection: string | null, tags: string[]) => void;
  
  // Auth Features (database backed)
  registerUser: (name: string, email: string, checkPassword: string) => Promise<{ success: boolean; error?: string }>;
  loginUser: (email: string, checkPassword: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  
  // API Management Features (database backed)
  createApiKey: (name: string) => Promise<void>;
  deleteApiKey: (id: string) => Promise<void>;
  incrementUsage: (keyId: string) => void;
  addApiLog: (log: Omit<ApiLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // Database synchronization features
  fetchKeys: (userId: string) => Promise<void>;
  fetchLogs: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      history: [],
      apiKeys: [],
      currentUser: null,
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

      // Register User via DB
      registerUser: async (name, email, password) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });

          const json = await res.json();
          if (!res.ok || json.error) {
            return { success: false, error: json.error || 'Registration failed.' };
          }

          set({
            currentUser: json.data.user,
            apiKeys: [json.data.defaultKey]
          });

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Connection error.' };
        }
      },

      // Login User via DB
      loginUser: async (email, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const json = await res.json();
          if (!res.ok || json.error) {
            return { success: false, error: json.error || 'Authentication failed.' };
          }

          set({
            currentUser: json.data.user,
            apiKeys: json.data.keys
          });

          // Fetch logs immediately on login
          get().fetchLogs(json.data.user.id);

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Connection error.' };
        }
      },

      // Logout User
      logoutUser: () => {
        set({ currentUser: null, apiKeys: [], apiLogs: [] });
      },

      // Fetch Keys from DB
      fetchKeys: async (userId) => {
        try {
          const res = await fetch(`/api/keys?userId=${encodeURIComponent(userId)}`);
          const json = await res.json();
          if (res.ok && json.data) {
            set({ apiKeys: json.data });
          }
        } catch (err) {
          console.error('Failed to fetch keys:', err);
        }
      },

      // Fetch Logs from DB
      fetchLogs: async (userId) => {
        try {
          const res = await fetch(`/api/logs?userId=${encodeURIComponent(userId)}`);
          const json = await res.json();
          if (res.ok && json.data) {
            set({ apiLogs: json.data });
          }
        } catch (err) {
          console.error('Failed to fetch logs:', err);
        }
      },

      // API Key Management mapped to DB
      createApiKey: async (name) => {
        const currentUserId = get().currentUser?.id;
        if (!currentUserId) return;

        try {
          const res = await fetch('/api/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, name })
          });
          const json = await res.json();
          if (res.ok && json.data) {
            set((state) => ({
              apiKeys: [...state.apiKeys, json.data]
            }));
          }
        } catch (err) {
          console.error('Failed to create api key:', err);
        }
      },

      deleteApiKey: async (id) => {
        try {
          const res = await fetch(`/api/keys?keyId=${encodeURIComponent(id)}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            set((state) => ({
              apiKeys: state.apiKeys.filter(k => k.id !== id)
            }));
          }
        } catch (err) {
          console.error('Failed to delete api key:', err);
        }
      },

      // Increment local count synchronously for immediate visual feedback, then we re-fetch from DB
      incrementUsage: (keyId) => set((state) => ({
        apiKeys: state.apiKeys.map(k => k.id === keyId ? { ...k, requestsCount: k.requestsCount + 1 } : k)
      })),

      // Append log locally for instant UI streaming, backend logging happens in /api/preview
      addApiLog: (log) => set((state) => {
        const newLog: ApiLog = {
          ...log,
          id: generateId(),
          timestamp: Date.now()
        };
        const currentLogs = [newLog, ...state.apiLogs].slice(0, 150);
        return { apiLogs: currentLogs };
      }),

      clearLogs: () => set({ apiLogs: [] })
    }),
    {
      name: 'link-preview-storage-v2',
      partialize: (state) => ({
        history: state.history,
        currentUser: state.currentUser,
        apiKeys: state.apiKeys,
        apiLogs: state.apiLogs,
      })
    }
  )
);
