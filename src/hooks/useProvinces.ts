import { useQuery } from "@tanstack/react-query"
import { shippingApi } from "../api/shipping"

/**
 * Hook để lấy danh sách tỉnh/thành phố.
 * Kế thừa defaultOptions từ QueryClientProvider (App.tsx).
 */
export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const response = await shippingApi.getProvinces()
      return response.result
    },
  })
}
