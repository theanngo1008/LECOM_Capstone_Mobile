import { useQuery } from "@tanstack/react-query";
import { shopApi } from "../../../api/shop";

/**
 * Hook để lấy địa chỉ kho của shop.
 * Kế thừa defaultOptions từ QueryClientProvider (App.tsx).
 */
export const useShopAddress = () => {
  return useQuery({
    queryKey: ["shop-address"],
    queryFn: async () => {
      try {
        const response = await shopApi.getShopAddress();
        console.log("✅ Fetched shop address:", response);
        return response;
      } catch (error: any) {
        // Handle 404 - Địa chỉ chưa được thiết lập
        if (error.response?.status === 404) {
          console.log("ℹ️ Shop address not found (404) - Returning null");
          return {
            isSuccess: true,
            result: null,
            message: "No shop address found",
          };
        }

        // Throw other errors
        console.error("❌ Error fetching shop address:", error);
        throw error;
      }
    },

    // ✅ Không retry nếu là 404
    retry: (failureCount, error: any) => {
      if (error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

