import { useQuery } from "@tanstack/react-query"
import { courseApi } from "@/api/course"

export const useLearnCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["learn-course", courseId],
    queryFn: () => courseApi.getLearnCourse(courseId),

    enabled: !!courseId,              // chỉ chạy khi có courseId
    staleTime: 1000 * 60 * 2,         // cache 2 phút
    refetchOnWindowFocus: false,      // tránh refetch liên tục
  })
}
