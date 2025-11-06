import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { profileApi, ChangePasswordPayload } from "../../../api/profile";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await profileApi.changePassword(payload);
      return response;
    },
    onSuccess: () => {
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
    },
    onError: (error: any) => {
      console.error("Error changing password:", error);
      Alert.alert("Lỗi", "Không thể đổi mật khẩu. Vui lòng thử lại.");
    },
  });
};
