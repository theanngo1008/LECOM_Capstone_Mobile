import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { shopApi, ShopResult } from "../../../api/shop";

export interface UpdateShopPayload {
  name?: string;
  description?: string;
  phoneNumber?: string;
  address?: string;
  businessType?: string;
  ownershipDocumentUrl?: string;
  shopAvatar?: string;
  shopBanner?: string;
  shopFacebook?: string;
  shopTiktok?: string;
  shopInstagram?: string;
  categoryId?: string;
  acceptedTerms?: boolean;
  ownerFullName?: string;
  ownerDateOfBirth?: string;
  ownerPersonalIdNumber?: string;
  ownerPersonalIdFrontUrl?: string;
  ownerPersonalIdBackUrl?: string;
}

export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateShopPayload }) => {
      console.log("Updating shop ID:", id);
      console.log("Payload:", payload);
      return shopApi.updateShop(id, payload);
    },

    onSuccess: (response) => {
      console.log("Update success:", response);

      if (response.isSuccess) {
        Alert.alert("Success", "Your shop has been updated successfully.");
        
        // Update cache với data mới
        queryClient.setQueryData(["my-shop"], response);
        
        // Hoặc invalidate để refetch
        // queryClient.invalidateQueries({ queryKey: ["my-shop"] });
      } else {
        Alert.alert(
          "Update Failed",
         response.errorMessages?.join("\n") || "Failed to update shop."
        );
      }
    },

    onError: (error: any) => {
      console.error("Update error:", error);
      Alert.alert(
        "Update Failed",
        error.response?.data?.message || 
        error.response?.data?.errorMessages?.join("\n") ||
        error.message || 
        "An error occurred while updating the shop."
      );
    },
  });
};