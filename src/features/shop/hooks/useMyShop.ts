import { useQuery } from "@tanstack/react-query";
import { shopApi } from "../../../api/shop";

export const useMyShop = () => {
  return useQuery({
    queryKey: ["my-shop"],
    queryFn: async () => {
      try {
        const response = await shopApi.getMyShop();
        console.log("✅ Fetched shop data:", response);
        return response;
      } catch (error: any) {
        // Handle 404 - Shop không tồn tại
        if (error.response?.status === 404) {
          console.log("ℹ️ Shop not found (404) - Returning null");
          return { 
            isSuccess: true, 
            result: null,
            message: "No shop found" 
          };
        }
        
        // Throw other errors
        console.error(" Error fetching shop:", error);
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