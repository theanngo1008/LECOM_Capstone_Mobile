import { useQuery } from "@tanstack/react-query"
import { communityApi, CommunityPostItem } from "@/api/community"
import type { ApiResponse } from "@/types/common"

export const useCommunityPostDetail = (postId: string) => {
  return useQuery<ApiResponse<CommunityPostItem>>({
    queryKey: ["community-post-detail", postId],
    queryFn: () => communityApi.getPostById(postId),
    enabled: !!postId, // chỉ gọi API khi có postId
  })
}
