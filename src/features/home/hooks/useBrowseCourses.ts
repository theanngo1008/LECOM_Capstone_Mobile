import { useQuery } from "@tanstack/react-query"
import { recombeeApi } from "@/api/recombee"

export const useBrowseCourses = () => {
  return useQuery({
    queryKey: ["browse-courses"],
    queryFn: () => recombeeApi.getBrowseCourses(),
  })
}
