import { useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackApi, CreateFeedbackPayload } from "@/api/feedback";
import { ToastAndroid, Platform, Alert } from "react-native";

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  const showMessage = (msg: string) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert("Thông báo", msg);
  };

  return useMutation({
    mutationFn: (payload: CreateFeedbackPayload) =>
      feedbackApi.createFeedback(payload),

    onSuccess: (res) => {
      showMessage("Gửi đánh giá thành công!");

      // ❗ Nếu bạn có query "feedback list" thì invalidate để refresh
      queryClient.invalidateQueries({ queryKey: ["feedback-product"] });

      // invalidate order detail nếu bạn hiển thị feedback trong order
      queryClient.invalidateQueries({ queryKey: ["order-detail"] });

      // invalidate product detail để update rating
      queryClient.invalidateQueries({ queryKey: ["product-detail"] });
    },

    onError: (error: any) => {
      console.log("Feedback error:", error?.response?.data || error);
      showMessage("Gửi đánh giá thất bại!");
    },
  });
}
