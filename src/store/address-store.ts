import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AddressHistory {
  provinceId: number;
  provinceName: string;
  districtId: number;
  districtName: string;
  wardCode: string;
  wardName: string;
  detailAddress: string;
  usedAt: number; // timestamp
}

interface AddressState {
  recentAddresses: AddressHistory[];
  lastUsedAddress: AddressHistory | null;
  addAddress: (address: Omit<AddressHistory, "usedAt">) => void;
  clearHistory: () => void;
  getRecentAddresses: (limit?: number) => AddressHistory[];
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      recentAddresses: [],
      lastUsedAddress: null,

      addAddress: (address) => {
        const newAddress: AddressHistory = {
          ...address,
          usedAt: Date.now(),
        };

        set((state) => {
          // Remove duplicate (same province, district, ward)
          const filtered = state.recentAddresses.filter(
            (a) =>
              a.provinceId !== address.provinceId ||
              a.districtId !== address.districtId ||
              a.wardCode !== address.wardCode
          );

          // Add to front, limit to 10
          const updated = [newAddress, ...filtered].slice(0, 10);

          return {
            recentAddresses: updated,
            lastUsedAddress: newAddress,
          };
        });
      },

      clearHistory: () => {
        set({ recentAddresses: [], lastUsedAddress: null });
      },

      getRecentAddresses: (limit = 10) => {
        return get().recentAddresses.slice(0, limit);
      },
    }),
    {
      name: "address-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

