import { useQuery } from "@tanstack/react-query"
import { shopCourseApi } from "../../../api/shopCourses"

export const useCourseProducts = () => {
  return useQuery({
    queryKey: ["shop-courses"],
    queryFn: async () => {
      try {
        const response = await shopCourseApi.getMyCourses()
        console.log("Fetched shop courses:", response)
        return response
      } catch (error: any) {
        console.error("Failed to fetch shop courses:", error)
        throw error
      }
    },
  })
}
