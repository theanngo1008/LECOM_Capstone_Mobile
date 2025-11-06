import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sau 2 phút data sẽ stale và tự động refetch khi component mount
      staleTime: 2 * 60 * 1000, // 2 phút (tăng để giảm refetch)

      // Data sẽ bị xóa khỏi cache sau 5 phút không dùng
      gcTime: 5 * 60 * 1000, // 5 phút (React Query v5+)

      // Retry 2 lần khi gặp lỗi (giảm để tránh spam)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

      // Không refetch khi focus vào window/app
      refetchOnWindowFocus: false,

      // Không refetch khi reconnect (tránh refetch liên tục)
      refetchOnReconnect: false,

      // Không tự động refetch khi mount (dùng manual refetch)
      refetchOnMount: false,
    },
    mutations: {
      // Retry 1 lần cho mutation
      retry: 1,
    },
  },
});
