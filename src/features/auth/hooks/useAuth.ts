// src/hooks/useAuth.ts
import { useAuthStore } from "@/store/auth-store"
import { apiClient } from "@/api/client"

export const useAuth = () => {
  const { setAuth, logout } = useAuthStore()

  const handleAuthSuccess = (token: string, refreshToken: string, userId: string) => {
    setAuth(token, refreshToken, userId)
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  return { handleAuthSuccess, logout }
}
