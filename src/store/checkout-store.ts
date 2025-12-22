import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CheckoutFormState {
  // Shipping info
  shipToName: string;
  shipToPhone: string;
  shipToAddress: string;
  note: string;

  // Address
  toProvinceId: number;
  toProvinceName: string;
  toDistrictId: number;
  toDistrictName: string;
  toWardCode: string;
  toWardName: string;

  // Payment
  paymentMethod: "payos" | "wallet";
  selectedVoucher: string | null;

  // Preview state
  hasPreviewed: boolean;
  previewData: any | null;

  // Actions
  updateForm: (data: Partial<CheckoutFormState>) => void;
  resetForm: () => void;
  setAddress: (address: {
    provinceId: number;
    provinceName: string;
    districtId: number;
    districtName: string;
    wardCode: string;
    wardName: string;
  }) => void;
  setPreviewData: (data: any) => void;
  clearPreview: () => void;
}

const initialState: Omit<
  CheckoutFormState,
  "updateForm" | "resetForm" | "setAddress" | "setPreviewData" | "clearPreview"
> = {
  shipToName: "",
  shipToPhone: "",
  shipToAddress: "",
  note: "",
  toProvinceId: 0,
  toProvinceName: "",
  toDistrictId: 0,
  toDistrictName: "",
  toWardCode: "",
  toWardName: "",
  paymentMethod: "payos",
  selectedVoucher: null,
  hasPreviewed: false,
  previewData: null,
};

export const useCheckoutStore = create<CheckoutFormState>()(
  persist(
    (set) => ({
      ...initialState,

      updateForm: (data) => {
        set((state) => ({ ...state, ...data }));
      },

      resetForm: () => {
        set(initialState);
      },

      setAddress: (address) => {
        set({
          toProvinceId: address.provinceId,
          toProvinceName: address.provinceName,
          toDistrictId: address.districtId,
          toDistrictName: address.districtName,
          toWardCode: address.wardCode,
          toWardName: address.wardName,
        });
      },

      setPreviewData: (data) => {
        set({
          previewData: data,
          hasPreviewed: true,
        });
      },

      clearPreview: () => {
        set({
          previewData: null,
          hasPreviewed: false,
        });
      },
    }),
    {
      name: "checkout-form-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist form data, không persist preview data
      partialize: (state) => ({
        shipToName: state.shipToName,
        shipToPhone: state.shipToPhone,
        shipToAddress: state.shipToAddress,
        note: state.note,
        toProvinceId: state.toProvinceId,
        toProvinceName: state.toProvinceName,
        toDistrictId: state.toDistrictId,
        toDistrictName: state.toDistrictName,
        toWardCode: state.toWardCode,
        toWardName: state.toWardName,
        paymentMethod: state.paymentMethod,
        selectedVoucher: state.selectedVoucher,
        hasPreviewed: false,
        previewData: null,
      }),
    }
  )
);

