import { courseApi } from "@/api/course"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCompleteLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lessonId: string) => courseApi.completeLesson(lessonId),

    onSuccess: (_, lessonId) => {
      // Tự refresh lại progress course
      queryClient.invalidateQueries({ queryKey: ["learn-course"] })
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] })
    }
  })
}
