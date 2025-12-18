import { useQuery } from "@tanstack/react-query";
import { shopApi } from "../../../api/shop";

/**
 * Hook để lấy trạng thái kết nối GHN của shop.
 * Kế thừa defaultOptions từ QueryClientProvider (App.tsx).
 */
export const useGHNStatus = () => {
  return useQuery({
    queryKey: ["ghn-status"],
    queryFn: async () => {
      try {
        const response = await shopApi.getGHNStatus();
        console.log("✅ Fetched GHN status:", response);
        return response;
      } catch (error: any) {
        console.error("❌ Error fetching GHN status:", error);
        throw error;
      }
    },
  });
};

