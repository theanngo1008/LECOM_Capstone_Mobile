import { useMutation, useQueryClient } from "@tanstack/react-query"
import { achievementsApi } from "@/api/achievements"

export const useClaimAchievement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await achievementsApi.claim(id)
      if (!response.isSuccess) {
        throw new Error(response.errorMessages?.[0] || "Không thể nhận thưởng")
      }
      return response
    },
    onSuccess: () => {
      // Invalidate achievements query để refetch và cập nhật isRewardClaimed
      queryClient.invalidateQueries({ queryKey: ["achievements"] })
    },
  })
}

