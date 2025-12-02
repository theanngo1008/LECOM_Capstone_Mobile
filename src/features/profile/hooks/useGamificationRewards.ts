import { useQuery } from "@tanstack/react-query"
import { gamificationApi } from "@/api/gamification"
import { GamificationRewardResponse } from "@/api/gamification"

export const useGamificationRewards = () => {
  return useQuery<GamificationRewardResponse>({
    queryKey: ["gamification", "rewards"],
    queryFn: gamificationApi.getRewards,
    staleTime: 1000 * 30, // 30s cache
  })
}
