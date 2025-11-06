import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { RegisterShopPayload, shopApi } from "../../../api/shop";

// ✅ Validation function
const validateRegisterShop = (payload: RegisterShopPayload): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Shop Information
  if (!payload.shopName?.trim()) {
    errors.push("Shop name is required");
  } else if (payload.shopName.trim().length < 3) {
    errors.push("Shop name must be at least 3 characters");
  }

  if (!payload.shopDescription?.trim()) {
    errors.push("Shop description is required");
  } else if (payload.shopDescription.trim().length < 10) {
    errors.push("Shop description must be at least 10 characters");
  }

  if (!payload.shopPhoneNumber?.trim()) {
    errors.push("Phone number is required");
  } else if (!/^0\d{9}$/.test(payload.shopPhoneNumber.trim())) {
    errors.push("Phone number must be 10 digits and start with 0");
  }

  if (!payload.shopAddress?.trim()) {
    errors.push("Shop address is required");
  }

  if (!payload.businessType?.trim()) {
    errors.push("Business type is required");
  }

  if (!payload.categoryId?.trim()) {
    errors.push("Category is required");
  }

  // Images & Documents
//   if (!payload.shopAvatar?.trim()) {
//     errors.push("Shop avatar is required");
//   }

//   if (!payload.shopBanner?.trim()) {
//     errors.push("Shop banner is required");
//   }

//   if (!payload.ownershipDocumentUrl?.trim()) {
//     errors.push("Ownership document is required");
//   }

  // Owner Information
  if (!payload.ownerFullName?.trim()) {
    errors.push("Owner full name is required");
  }

  if (!payload.ownerDateOfBirth) {
    errors.push("Owner date of birth is required");
  } else {
    const dob = new Date(payload.ownerDateOfBirth);
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    if (isNaN(dob.getTime())) {
      errors.push("Invalid date of birth format");
    } else if (age < 18) {
      errors.push("Owner must be at least 18 years old");
    } else if (age > 100) {
      errors.push("Invalid date of birth");
    }
  }

  if (!payload.ownerPersonalIdNumber?.trim()) {
    errors.push("Personal ID number is required");
  } else if (!/^\d{9,12}$/.test(payload.ownerPersonalIdNumber.trim())) {
    errors.push("Personal ID number must be 9-12 digits");
  }

//   if (!payload.ownerPersonalIdFrontUrl?.trim()) {
//     errors.push("Personal ID front image is required");
//   }

//   if (!payload.ownerPersonalIdBackUrl?.trim()) {
//     errors.push("Personal ID back image is required");
//   }

  // Terms & Conditions
  if (!payload.acceptedTerms) {
    errors.push("You must accept the terms and conditions");
  }

  

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const useRegisterShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterShopPayload) => {
      console.log("Registering shop with payload:", payload);

      // Validate before sending request
      const validation = validateRegisterShop(payload);
      
      if (!validation.isValid) {
        console.error("Validation failed:", validation.errors);
        
        // Show first 3 errors only (để không quá dài)
        const displayErrors = validation.errors.slice(0, 3);
        const remaining = validation.errors.length - 3;
        
        const errorMessage = 
          displayErrors.join("\n") + 
          (remaining > 0 ? `\n... and ${remaining} more error(s)` : "");
        
        throw new Error(errorMessage);
      }

      return shopApi.registerShop(payload);
    },

    onSuccess: (response) => {
      console.log(" Register success:", response);

      if (response.isSuccess) {
        Alert.alert(
          "🎉 Success",
          "Your shop has been registered successfully!\n\nStatus: Pending Approval\n\nYou will be notified once admin reviews your shop (usually 1-3 business days).",
          [
            {
              text: "Got it!",
              onPress: () => {
                // Invalidate my-shop query để refetch data mới
                queryClient.invalidateQueries({ queryKey: ["my-shop"] });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Registration Failed",
          
            response.errorMessages?.join("\n") ||
            "Failed to register shop."
        );
      }
    },

    onError: (error: any) => {
      console.error("Register error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorMessages?.join("\n") ||
        error.message ||
        "An error occurred while registering the shop.";

      Alert.alert("❌ Registration Failed", errorMessage);
    },
  });
};