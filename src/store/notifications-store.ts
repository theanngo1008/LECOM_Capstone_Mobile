import { create } from "zustand";

interface NotificationsState {
  unreadCount: number;
  latestNotification: any | null;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setLatestNotification: (notification: any) => void;
  clearLatestNotification: () => void;
  resetUnreadCount: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  latestNotification: null,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnreadCount: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  decrementUnreadCount: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  setLatestNotification: (notification) => {
    set({ latestNotification: notification });
  },

  clearLatestNotification: () => {
    set({ latestNotification: null });
  },

  resetUnreadCount: () => {
    set({ unreadCount: 0 });
  },
}));

