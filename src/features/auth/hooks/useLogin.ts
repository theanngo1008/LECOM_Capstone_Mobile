// src/hooks/useLogin.ts
import { authApi, LoginRequest, LoginResponse } from "@/api/auth"
import { useMutation } from "@tanstack/react-query"
import { Alert } from "react-native"
import { useAuth } from "./useAuth"

export const useLogin = () => {
  const { handleAuthSuccess } = useAuth()

  const loginMutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (input) => {
      const res = await authApi.login(input)
      if (!res.isSuccess) {
        // ✅ Throw custom error with errorMessages
        const error = new Error("Đăng nhập thất bại") as any
        error.errorMessages = res.errorMessages
        error.statusCode = res.statusCode
        throw error
      }
      return res
    },

    onSuccess: (data) => {
      const { token, refreshToken, userId } = data.result
      handleAuthSuccess(token, refreshToken, userId)
      Alert.alert("Thành công", "Đăng nhập thành công!")
    },

    onError: (error: any) => {
      // ✅ Extract error messages from axios error response
      const errorMessages = error.response?.data?.errorMessages || error.errorMessages || []
      const errorMessage = errorMessages[0] || error.message || "Đăng nhập thất bại"
      
      console.log("🚨 useLogin Error:", {
        hasResponse: !!error.response,
        responseData: error.response?.data,
        errorMessages,
        finalMessage: errorMessage,
      })
      
      Alert.alert("Đăng nhập thất bại", errorMessage)
    },
  })

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
  }
}