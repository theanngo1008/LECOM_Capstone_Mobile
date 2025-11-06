import { useQuery } from "@tanstack/react-query";
import { postsApi } from "../../../api/posts";
import { postKeys } from "./usePosts";

export const usePost = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.getPost(id),
    // ⚠️ KHÔNG fetch nếu:
    // - enabled = false
    // - id âm (local post không tồn tại trên server)
    // - id không hợp lệ
    enabled: enabled && id > 0 && !!id,
    // Data sẽ stale sau 5 phút cho detail page
    staleTime: 5 * 60 * 1000,
    // Giảm retry để tránh spam API
    retry: 1,
  });
};
