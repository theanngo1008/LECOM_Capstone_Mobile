// src/hooks/useResetPasswordConfirm.ts
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  authApi,
  ResetPasswordConfirmRequest,
} from "@/api/auth";

export function useResetPasswordConfirm() {
  const mutation = useMutation({
    mutationFn: async (input: ResetPasswordConfirmRequest) => {
      const res = await authApi.confirmResetPassword(input);
      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Đặt lại mật khẩu thất bại");
      }
      return res;
    },

    onSuccess: () => {
      Alert.alert(
        "Thành công",
        "Mật khẩu của bạn đã được thay đổi thành công!",
      );
    },

    onError: (err: any) => {
      Alert.alert("Lỗi", err.message || "Không thể đặt lại mật khẩu");
    },
  });

  return {
    confirmResetPassword: mutation.mutate,
    confirmResetPasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
