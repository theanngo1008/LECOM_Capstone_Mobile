import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, refreshToken: string, userId: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: true, // ✅ Start loading

      setAuth: (token, refreshToken, userId) => {
        console.log("✅ Auth Store: setAuth", { userId, hasToken: !!token });
        set({
          token,
          refreshToken,
          userId,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          console.log("🚪 Auth Store: Starting logout...");
          
          // ✅ 1. Clear Zustand state
          set({
            token: null,
            refreshToken: null,
            userId: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // ✅ 2. Clear ALL AsyncStorage (xóa toàn bộ cache)
          await AsyncStorage.clear();
          console.log("✅ AsyncStorage cleared completely");

        } catch (error) {
          console.error("❌ Logout error:", error);
          // Force clear state even if AsyncStorage fails
          set({
            token: null,
            refreshToken: null,
            userId: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setLoading: (loading) => {
        console.log("⏳ Auth Store: setLoading", loading);
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      
      // ✅ Rehydrate callback
      onRehydrateStorage: () => {
        console.log("🔄 Auth Store: Starting rehydration...");
        
        return (state, error) => {
          if (error) {
            console.error("❌ Auth Store: Rehydrate error:", error);
            state?.setLoading(false);
          } else {
            console.log("✅ Auth Store: Rehydrated", {
              hasToken: !!state?.token,
              hasRefreshToken: !!state?.refreshToken,
              isAuthenticated: state?.isAuthenticated,
              userId: state?.userId,
            });
          }
          
          // ✅ Finish loading AFTER rehydrate
          state?.setLoading(false);
        };
      },
    }
  )
);