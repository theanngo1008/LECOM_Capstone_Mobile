import { useInfiniteQuery } from "@tanstack/react-query";
import { postsApi } from "../../../api/posts";

// Query Keys Factory - Tổ chức query keys theo pattern
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (page?: number) => [...postKeys.lists(), { page }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  byUser: (userId: number) => [...postKeys.all, "byUser", userId] as const,
};

export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: postKeys.lists(),
    queryFn: ({ pageParam = 1 }) => postsApi.getPosts(pageParam, 10),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    // Giữ data cũ trong khi fetch page mới
    placeholderData: (previousData) => previousData,
    // Data tươi trong 3 phút
    staleTime: 3 * 60 * 1000,
    // Giảm retry cho infinite query
    retry: 1,
  });
};
