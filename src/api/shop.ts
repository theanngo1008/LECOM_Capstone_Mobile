import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

export interface ShopResult {
  id: number
  name: string
  description: string
  phoneNumber: string
  address: string
  businessType: string
  ownershipDocumentUrl: string
  shopAvatar: string
  shopBanner: string
  shopFacebook: string
  shopTiktok: string
  shopInstagram: string
  categoryId: string
  categoryName: string
  status: string
  rejectedReason: string | null
  ownerFullName: string
  ownerDateOfBirth: string
  ownerPersonalIdNumber: string
  ownerPersonalIdFrontUrl: string
  ownerPersonalIdBackUrl: string
  sellerId: string
  createdAt: string
  approvedAt: string | null
}

export interface RegisterShopPayload {
  shopName: string;
  shopDescription: string;
  shopPhoneNumber: string;
  shopAddress: string;
  businessType: string;
  ownershipDocumentUrl: string;
  shopAvatar: string;
  shopBanner: string;
  shopFacebook?: string;
  shopTiktok?: string;
  shopInstagram?: string;
  categoryId: string;
  acceptedTerms: boolean;
  ownerFullName: string;
  ownerDateOfBirth: string; // ISO 8601 format: "2003-10-28T21:21:51.210Z"
  ownerPersonalIdNumber: string;
  ownerPersonalIdFrontUrl: string;
  ownerPersonalIdBackUrl: string;
}

export type ShopResponse = ApiResponse<ShopResult>


export const shopApi = {
  getMyShop: async (): Promise<ShopResponse> => {
    const { data } = await apiClient.get<ShopResponse>("/Seller/my-shop");
    return data;
  },

  updateShop: async (id: number, payload: Partial<ShopResult>): Promise<ShopResponse> => {
    const { data } = await apiClient.put<ShopResponse>(`/Seller/${id}`, payload);
    return data;
  },

  deleteShop: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/Seller/${id}`);
    return data;
  },
  registerShop: async (
    payload: RegisterShopPayload
  ): Promise<ShopResponse> => {
    const { data } = await apiClient.post<ShopResponse>(
      "/Seller/register",
      payload
    );
    return data;
  },
};

