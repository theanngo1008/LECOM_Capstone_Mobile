import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, EditProfilePayload } from "../../../api/profile";
import { Alert } from "react-native";

export const useEditProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EditProfilePayload) => {
      const response = await profileApi.editMyProfile(payload);
      return response;
    },
    onSuccess: (data) => {
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
      // Cập nhật lại cache của hồ sơ
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: any) => {
      console.error("❌ Error editing profile:", error);
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    },
  });
};
