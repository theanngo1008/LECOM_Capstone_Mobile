import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"
import { shopCourseApi } from "../../../api/shopCourses"

export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shopCourseApi.createCourse,
    onSuccess: (data) => {
      if (data.isSuccess) {
        Alert.alert("Success", "Course created successfully!")
        queryClient.invalidateQueries({ queryKey: ["shop-courses"] })
      } else {
        Alert.alert("Error", data.errorMessages?.[0] || "Failed to create course")
      }
    },
    onError: (error: any) => {
      console.error("❌ Failed to create course:", error)
      Alert.alert("Error", error.message || "Something went wrong while creating course")
    },
  })
}
