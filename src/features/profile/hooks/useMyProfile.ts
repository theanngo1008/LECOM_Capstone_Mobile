import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../../../api/profile";

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      try {
        const response = await profileApi.getMyProfile();
        console.log("✅ Fetched profile data:", response);
        return response;
      } catch (error: any) {
        // Handle 404 - Profile không tồn tại
        if (error.response?.status === 404) {
          console.log("⚠️ Profile not found (404) - User chưa có profile");
          return {
            isSuccess: true,
            result: null,
            message: "No profile found",
          };
        }

        // Handle 401 - Token expired
        if (error.response?.status === 401) {
          console.log("🔄 Token expired (401) - Refresh token triggered");
          throw error; // Let interceptor handle refresh
        }

        // Throw other errors
        console.error("❌ Error fetching profile:", error);
        throw error;
      }
    },

    // ✅ Retry config
    retry: (failureCount, error: any) => {
      // Retry 2 lần nếu 401 (chờ refresh token)
      if (error?.response?.status === 401 && failureCount < 2) {
        console.log(`🔄 Retrying profile fetch (${failureCount + 1}/2)...`);
        return true;
      }
      // Không retry nếu 404
      if (error?.response?.status === 404) {
        return false;
      }
      // Retry tối đa 2 lần cho các lỗi khác
      return failureCount < 2;
    },

    // ✅ Tăng delay để chờ refresh token hoàn thành
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * (attemptIndex + 1), 3000); // 1s, 2s, 3s
      console.log(`⏳ Retry delay: ${delay}ms`);
      return delay;
    },

    staleTime: 2 * 60 * 1000, // 2 phút

    // ✅ Disable auto refetch
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};