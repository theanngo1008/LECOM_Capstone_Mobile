// src/hooks/useRegister.ts
import { authApi, RegisterRequest, RegisterResult } from "@/api/auth"
import { useMutation } from "@tanstack/react-query"
import { Alert } from "react-native"

export const useRegister = () => {
  const registerMutation = useMutation<RegisterResult, Error, RegisterRequest>({
    mutationFn: async (input) => {
      const res = await authApi.register(input)
      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Đăng ký thất bại")
      }
      return res.result
    },

    onSuccess: (data) => {
      Alert.alert("Thành công", data.message || "Đăng ký thành công, vui lòng kiểm tra email!")
      
    },

    onError: (error) => {
      Alert.alert("Đăng ký thất bại", error.message)
    },
  })

  return {
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isLoading: registerMutation.isPending,
  }
}
