import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { shopApi, ShopAddressPayload } from "../../../api/shop";

export const useUpdateShopAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, payload }: { addressId: number; payload: ShopAddressPayload }) => {
      console.log("📝 Updating shop address:", addressId, payload);
      return shopApi.updateShopAddress(addressId, payload);
    },

    onSuccess: (response) => {
      console.log("✅ Update shop address success:", response);

      if (response.isSuccess) {
        Alert.alert("Thành công", "Địa chỉ kho đã được cập nhật thành công.");

        // Update cache với data mới
        queryClient.setQueryData(["shop-address"], response);
      } else {
        Alert.alert(
          "Thất bại",
          response.errorMessages?.join("\n") || "Không thể cập nhật địa chỉ kho."
        );
      }
    },

    onError: (error: any) => {
      console.error("❌ Update shop address error:", error);
      Alert.alert(
        "Thất bại",
        error.response?.data?.message ||
          error.response?.data?.errorMessages?.join("\n") ||
          error.message ||
          "Đã xảy ra lỗi khi cập nhật địa chỉ kho."
      );
    },
  });
};

