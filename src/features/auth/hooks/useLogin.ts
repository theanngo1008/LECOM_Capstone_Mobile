// src/hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query"
import { Alert } from "react-native"
import { authApi, LoginRequest, LoginResponse } from "@/api/auth"
import { useAuth } from "./useAuth"

export const useLogin = () => {
  const { handleAuthSuccess } = useAuth()

  const loginMutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (input) => {
      const res = await authApi.login(input)
      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Đăng nhập thất bại")
      }
      return res
    },

    onSuccess: (data) => {
      const { token, refreshToken, userId } = data.result
      handleAuthSuccess(token, refreshToken, userId)
      Alert.alert("Thành công", "Đăng nhập thành công!")
    },

    onError: (error) => {
      Alert.alert("Đăng nhập thất bại", error.message)
    },
  })

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
  }
}
