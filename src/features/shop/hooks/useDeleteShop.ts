import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { shopApi } from "../../../api/shop";

export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      console.log("🗑️ Deleting shop ID:", id);
      return shopApi.deleteShop(id);
    },

    onSuccess: (response) => {
      console.log(" Delete success:", response);

      if (response.isSuccess) {
        Alert.alert("Success", "Your shop has been deleted successfully.");
        
        // Set cache to null directly - NO refetch
        queryClient.setQueryData(["my-shop"], { 
          isSuccess: true, 
          result: null,
          message: "Shop deleted"
        });
        console.log(" Cache updated to null");
      } else {
        Alert.alert("Error", response.errorMessages?.join("\n") || "Failed to delete shop.");
      }
    },

    onError: (error: any) => {
      console.error("❌ Delete error:", error);
      Alert.alert(
        "Delete Failed",
        error.response?.data?.message || error.message || "An error occurred."
      );
    },
  });
};