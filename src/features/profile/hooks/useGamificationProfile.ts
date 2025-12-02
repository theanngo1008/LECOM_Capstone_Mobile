import { useQuery } from "@tanstack/react-query"
import { gamificationApi } from "@/api/gamification"

export const useGamificationProfile = () => {
  return useQuery({
    queryKey: ["gamification-profile"],
    queryFn: () => gamificationApi.getProfile(),
    staleTime: 1000 * 30, // cache 30s
  })
}
