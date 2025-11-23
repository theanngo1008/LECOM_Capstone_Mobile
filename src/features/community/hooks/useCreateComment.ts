import { communityApi, CreateCommentPayload, CreateCommentResponse } from "@/api/community"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation<CreateCommentResponse, any, CreateCommentPayload>({
    mutationFn: (payload) => communityApi.createComment(postId, payload),

    onSuccess: () => {
      // Tự động refresh lại bài viết sau khi bình luận thành công
      queryClient.invalidateQueries({
        queryKey: ["community-post-detail", postId],
      })
    },
  })
}
