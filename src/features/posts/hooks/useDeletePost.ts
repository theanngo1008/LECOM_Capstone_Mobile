import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { postsApi } from "../../../api/posts";
import { postKeys } from "./usePosts";

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postsApi.deletePost(id),

    onSuccess: (_data, deletedId) => {
      // 1. Xóa detail cache của post này
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) });

      // 2. Update cache manually (không refetch vì API fake)
      queryClient.setQueriesData({ queryKey: postKeys.lists() }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((post: any) => post.id !== deletedId),
            totalCount: page.totalCount - 1,
          })),
        };
      });

      Alert.alert("Thành công", "Đã xóa bài viết! 🗑️");
    },

    onError: (error) => {
      Alert.alert("Lỗi", "Không thể xóa bài viết. Vui lòng thử lại.");
      console.error("Delete post error:", error);
    },
  });
};
