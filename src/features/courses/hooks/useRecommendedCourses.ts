import { useQuery } from "@tanstack/react-query"
import { recombeeApi } from "@/api/recombee"

export const useRecommendedCourses = (slug: string) => {
  return useQuery({
    queryKey: ["recommended-courses", slug],
    queryFn: () => recombeeApi.getRecommendedCourses(slug),
    enabled: !!slug,
  })
}
