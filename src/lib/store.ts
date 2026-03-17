import { create } from 'zustand';
import type { TimeRange, Brand, Platform } from '@/types';

// Dashboard filter state
interface FilterState {
  timeRange: TimeRange;
  brandId: string | null;
  platformId: string | null;
  customDateRange: { from: Date; to: Date } | null;
  
  // Actions
  setTimeRange: (range: TimeRange) => void;
  setBrandId: (id: string | null) => void;
  setPlatformId: (id: string | null) => void;
  setCustomDateRange: (range: { from: Date; to: Date } | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  timeRange: 'last30days',
  brandId: null,
  platformId: null,
  customDateRange: null,
  
  setTimeRange: (range) => set({ timeRange: range }),
  setBrandId: (id) => set({ brandId: id }),
  setPlatformId: (id) => set({ platformId: id }),
  setCustomDateRange: (range) => set({ customDateRange: range }),
  resetFilters: () => set({
    timeRange: 'last30days',
    brandId: null,
    platformId: null,
    customDateRange: null,
  }),
}));

// UI state
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeDashboard: 'executive' | 'financial' | 'marketing' | 'product' | 'platform' | 'brand' | 'forecast' | 'connections' | 'settings' | 'help' | 'users' | 'audit-logs';
  aiChatOpen: boolean;
  searchOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setActiveDashboard: (dashboard: UIState['activeDashboard']) => void;
  toggleAIChat: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  activeDashboard: 'executive',
  aiChatOpen: false,
  searchOpen: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setActiveDashboard: (dashboard) => set({ activeDashboard: dashboard }),
  toggleAIChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));

// Dashboard data cache
interface DashboardState {
  data: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  setData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refresh: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
  
  setData: (data) => set({ data, loading: false, error: null, lastUpdated: new Date() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  refresh: () => set({ lastUpdated: new Date() }),
}));

// AI Chat state
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface AIChatState {
  messages: Message[];
  isLoading: boolean;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  messages: [],
  isLoading: false,
  
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      },
    ],
  })),
  
  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages];
    if (messages.length > 0) {
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content,
        loading: false,
      };
    }
    return { messages };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}));
