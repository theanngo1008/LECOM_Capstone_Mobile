// src/hooks/useLeaderboard.ts
import { useQuery } from "@tanstack/react-query"
import { gamificationApi, LeaderboardPeriod } from "@/api/gamification"

export const useLeaderboard = (period: LeaderboardPeriod) => {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const res = await gamificationApi.getLeaderboard(period)

      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Không thể tải leaderboard")
      }

      return res.result
    },
    staleTime: 1000 * 60, // 1 minute
  })
}
