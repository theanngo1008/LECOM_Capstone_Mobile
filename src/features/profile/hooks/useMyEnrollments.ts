import { useQuery } from "@tanstack/react-query"
import { courseApi } from "@/api/course"

export const useMyEnrollments = () => {
  return useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const res = await courseApi.getMyEnrollments()

      if (!res.isSuccess) {
        throw new Error(res.errorMessages?.[0] || "Không tải được danh sách khóa học đã đăng ký")
      }

      return res.result || []
    },
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  })
}

