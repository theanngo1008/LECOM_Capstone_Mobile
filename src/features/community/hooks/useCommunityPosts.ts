import { useQuery } from "@tanstack/react-query"
import { communityApi, CommunityPostItem } from "@/api/community"
import type { ApiResponse } from "@/types/common"

export const useCommunityPosts = () => {
  return useQuery<ApiResponse<CommunityPostItem[]>>({
    queryKey: ["community-posts"],
    queryFn: communityApi.getPosts,
  })
}
