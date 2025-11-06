import { ApiResponse } from "../types/common";
import { apiClient } from "./client";

export interface ProfileResult {
    id: string,
    fullName: string,
    userName: string,
    email: string,
    phoneNumber: string,
    address: string,
    dateOfBirth: string,
    imageUrl: string,
}
export type ProfileResponse = ApiResponse<ProfileResult>

export interface EditProfilePayload {
    id?: string;
    fullName?: string;
    userName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    imageUrl?: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export const profileApi = {
    getMyProfile: async (): Promise<ProfileResponse> => {
        console.log("📤 API: Calling GET /user/profile");
        try {
            const { data } = await apiClient.get<ProfileResponse>("/user/profile");
            console.log("📥 API: Profile response:", {
                isSuccess: data.isSuccess,
                hasResult: !!data.result,
                profileId: data.result?.id,
                fullName: data.result?.fullName,
            });
            return data;
        } catch (error: any) {
            console.error("❌ API: Profile fetch error:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.response?.data?.message,
                errorMessages: error.response?.data?.errorMessages,
                url: error.config?.url,
            });
            throw error;
        }
    },

    editMyProfile: async (payload: EditProfilePayload): Promise<ProfileResponse> => {
        console.log("📤 API: Calling PUT /user/profile", {
            fullName: payload.fullName,
            email: payload.email,
            phoneNumber: payload.phoneNumber,
            hasImage: !!payload.imageUrl,
        });
        try {
            const { data } = await apiClient.put<ProfileResponse>("/user/profile", payload);
            console.log("📥 API: Edit profile response:", {
                isSuccess: data.isSuccess,
                updatedFields: Object.keys(payload),
            });
            return data;
        } catch (error: any) {
            console.error("❌ API: Edit profile error:", {
                status: error.response?.status,
                message: error.response?.data?.message,
                errorMessages: error.response?.data?.errorMessages,
                payload,
            });
            throw error;
        }
    },

    changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
        console.log("📤 API: Calling POST /user/change-password");
        try {
            const { data } = await apiClient.post<ApiResponse<null>>("/user/change-password", {
                oldPassword: payload.oldPassword,
                newPassword: payload.newPassword,
            });
            console.log("📥 API: Change password response:", {
                isSuccess: data.isSuccess,
                message: data.message,
            });
            return data;
        } catch (error: any) {
            console.error("❌ API: Change password error:", {
                status: error.response?.status,
                message: error.response?.data?.message,
                errorMessages: error.response?.data?.errorMessages,
            });
            throw error;
        }
    }
};