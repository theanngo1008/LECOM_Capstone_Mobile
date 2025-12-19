import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { shopApi, ShopAddressPayload } from "../../../api/shop";

export const useSetShopAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShopAddressPayload) => {
      console.log("📝 Setting shop address:", payload);
      return shopApi.setShopAddress(payload);
    },

    onSuccess: (response) => {
      console.log("✅ Set shop address success:", response);

      if (response.isSuccess) {
        Alert.alert("Thành công", "Địa chỉ kho đã được thiết lập thành công.");

        // Update cache với data mới
        queryClient.setQueryData(["shop-address"], response);
      } else {
        Alert.alert(
          "Thất bại",
          response.errorMessages?.join("\n") || "Không thể thiết lập địa chỉ kho."
        );
      }
    },

    onError: (error: any) => {
      console.error("❌ Set shop address error:", error);
      Alert.alert(
        "Thất bại",
        error.response?.data?.message ||
          error.response?.data?.errorMessages?.join("\n") ||
          error.message ||
          "Đã xảy ra lỗi khi thiết lập địa chỉ kho."
      );
    },
  });
};



