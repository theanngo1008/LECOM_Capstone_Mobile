import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartSelectionState {
  selectedProductIds: string[];
  toggleProduct: (productId: string) => void;
  selectAll: (productIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (productId: string) => boolean;
  setSelectedProducts: (productIds: string[]) => void;
}

export const useCartSelectionStore = create<CartSelectionState>()(
  persist(
    (set, get) => ({
      selectedProductIds: [],

      toggleProduct: (productId) => {
        set((state) => {
          const isSelected = state.selectedProductIds.includes(productId);
          return {
            selectedProductIds: isSelected
              ? state.selectedProductIds.filter((id) => id !== productId)
              : [...state.selectedProductIds, productId],
          };
        });
      },

      selectAll: (productIds) => {
        set({ selectedProductIds: productIds });
      },

      clearSelection: () => {
        set({ selectedProductIds: [] });
      },

      isSelected: (productId) => {
        return get().selectedProductIds.includes(productId);
      },

      setSelectedProducts: (productIds) => {
        set({ selectedProductIds: productIds });
      },
    }),
    {
      name: "cart-selection-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

