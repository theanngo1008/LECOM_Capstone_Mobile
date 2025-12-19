import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { shopApi, GHNConnectPayload } from "../../../api/shop";

export const useConnectGHN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GHNConnectPayload) => {
      console.log("🔗 Connecting to GHN:", payload);
      return shopApi.connectGHN(payload);
    },

    onSuccess: (response) => {
      console.log("✅ Connect GHN success:", response);

      if (response.isSuccess) {
        Alert.alert("Thành công", response.result?.message || "Đã kết nối với GHN thành công.");

        // Update cache với data mới
        queryClient.setQueryData(["ghn-status"], response);
      } else {
        Alert.alert(
          "Thất bại",
          response.errorMessages?.join("\n") || "Không thể kết nối với GHN."
        );
      }
    },

    onError: (error: any) => {
      console.error("❌ Connect GHN error:", error);
      Alert.alert(
        "Thất bại",
        error.response?.data?.message ||
          error.response?.data?.errorMessages?.join("\n") ||
          error.message ||
          "Đã xảy ra lỗi khi kết nối với GHN."
      );
    },
  });
};



