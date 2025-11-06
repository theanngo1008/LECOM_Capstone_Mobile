import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { CreatePostInput, Post, postsApi } from "../../../api/posts";
import { postKeys } from "./usePosts";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => postsApi.createPost(input),

    // OPTIMISTIC UPDATE
    onMutate: async (newPost) => {
      // 1. Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // 2. Snapshot previous data (để rollback nếu fail)
      const previousPosts = queryClient.getQueryData(postKeys.lists());

      // 3. Optimistically update cache
      queryClient.setQueryData(postKeys.lists(), (old: any) => {
        if (!old) return old;

        // Dùng ID âm để phân biệt local posts (không fetch detail được)
        const optimisticPost: Post = {
          id: -Date.now(), // Fake ID (âm) - không navigate detail
          userId: newPost.userId,
          title: newPost.title,
          body: newPost.body,
        };

        return {
          ...old,
          pages: [
            {
              posts: [optimisticPost, ...old.pages[0].posts],
              nextPage: old.pages[0].nextPage,
              totalCount: old.pages[0].totalCount + 1,
            },
            ...old.pages.slice(1),
          ],
        };
      });

      // Return context để dùng trong onError
      return { previousPosts };
    },

    onSuccess: (serverPost) => {
      console.log("✅ Server returned post:", serverPost);

      // JSONPlaceholder trả ID > 100 (không tồn tại thật)
      // Giữ post với fake ID âm trong cache thay vì replace
      // Vì navigate vào detail sẽ 404

      Alert.alert(
        "Thành công",
        "Tạo bài viết mới thành công! 🎉\n\n⚠️ Lưu ý: Đây là demo API, post chỉ hiển thị trong app.",
        [{ text: "OK" }]
      );
    },

    onError: (error, _newPost, context) => {
      // Rollback về data cũ
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }

      Alert.alert("Lỗi", "Không thể tạo bài viết. Vui lòng thử lại.");
      console.error("Create post error:", error);
    },

    // KHÔNG invalidate để giữ post mới
    // JSONPlaceholder API không lưu data thật nên không cần refetch
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      console.log("✅ Post created - cache updated manually");
    },
  });
};
