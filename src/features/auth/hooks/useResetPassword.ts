import { useMutation } from "@tanstack/react-query"
import { Alert } from "react-native"
import {
  authApi,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/api/auth"

export function useResetPassword() {
  const mutation = useMutation<
    ResetPasswordResponse,
    Error,
    ResetPasswordRequest
  >({
    mutationFn: async (input) => {
      const res = await authApi.resetPassword(input)

      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Gửi email đặt lại mật khẩu thất bại")
      }

      return res
    },

    onSuccess: (data) => {
      Alert.alert(
        "Thành công",
        data.result?.message || "Kiểm tra email để đặt lại mật khẩu!"
      )
    },

    onError: (error) => {
      Alert.alert("Thất bại", error.message)
    },
  })

  return {
    resetPassword: mutation.mutate,
    resetPasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  }
}
