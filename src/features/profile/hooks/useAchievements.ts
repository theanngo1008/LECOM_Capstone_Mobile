import { useQuery } from "@tanstack/react-query"
import { achievementsApi } from "@/api/achievements"

export const useAchievements = () => {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await achievementsApi.getAll()

      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Không tải được achievements")
      }

      return res.result.achievements
    },
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  })
}
