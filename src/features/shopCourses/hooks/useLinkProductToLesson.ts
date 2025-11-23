import {
  LinkProductToLessonPayload,
  LinkProductToLessonResponse,
  shopCourseApi
} from "@/api/shopCourses"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useLinkProductToLesson = (courseId: string) => {
  const queryClient = useQueryClient()

  return useMutation<LinkProductToLessonResponse, any, LinkProductToLessonPayload>({
    mutationFn: (payload) => shopCourseApi.linkProductToLesson(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-sections", courseId],
      })
    }
  })
}

