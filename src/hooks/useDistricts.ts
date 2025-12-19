import { useQuery } from "@tanstack/react-query"
import { shippingApi } from "../api/shipping"

/**
 * Hook để lấy danh sách quận/huyện dựa trên ProvinceID.
 * Kế thừa defaultOptions từ QueryClientProvider (App.tsx).
 */
export const useDistricts = (provinceId: number | null | undefined) => {
  return useQuery({
    queryKey: ["districts", provinceId],
    queryFn: async () => {
      if (!provinceId) return []; // Return empty array if no provinceId
      const response = await shippingApi.getDistricts(provinceId)
      return response.result
    },
    enabled: !!provinceId, // Chỉ fetch khi có provinceId
  })
}



