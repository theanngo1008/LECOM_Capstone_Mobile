import { useQuery } from "@tanstack/react-query"
import { shippingApi } from "../api/shipping"

/**
 * Hook để lấy danh sách phường/xã dựa trên DistrictID.
 * Kế thừa defaultOptions từ QueryClientProvider (App.tsx).
 */
export const useWards = (districtId: number | null | undefined) => {
  return useQuery({
    queryKey: ["wards", districtId],
    queryFn: async () => {
      if (!districtId) return []; // Return empty array if no districtId
      const response = await shippingApi.getWards(districtId)
      return response.result
    },
    enabled: !!districtId, // Chỉ fetch khi có districtId
  })
}

