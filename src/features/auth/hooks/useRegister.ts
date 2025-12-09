// src/hooks/useRegister.ts
import { authApi, RegisterRequest, RegisterResult } from "@/api/auth"
import { useMutation } from "@tanstack/react-query"

export const useRegister = () => {
  const registerMutation = useMutation<RegisterResult, Error, RegisterRequest>({
    mutationFn: async (input) => {
      const res = await authApi.register(input)
      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Đăng ký thất bại")
      }
      return res.result
    },
  })

  return {
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isLoading: registerMutation.isPending,
  }
}