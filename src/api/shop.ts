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
  provinceId: number;
  provinceName: string;
  districtId: number;
  districtName: string;
  wardCode: string;
  wardName: string;
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
  ownerDateOfBirth: string; 
  ownerPersonalIdNumber: string;
  ownerPersonalIdFrontUrl: string;
  ownerPersonalIdBackUrl: string;
}

export interface ShopAddress {
  id: number
  shopId: number
  provinceId: number
  provinceName: string
  districtId: number
  districtName: string
  wardCode: string
  wardName: string
  detailAddress: string
  isDefault: boolean
  contactName: string
  contactPhone: string
}

export interface GHNStatus {
  isConnected: boolean
  ghnShopId: string
  connectedAt: string | null
  message: string
}

export interface GHNConnectPayload {
  ghnToken: string
  ghnShopId: string
}

export interface ShopAddressPayload {
  provinceId: number
  provinceName: string
  districtId: number
  districtName: string
  wardCode: string
  wardName: string
  detailAddress: string
  contactName: string
  contactPhone: string
  isDefault: boolean
}

export type ShopResponse = ApiResponse<ShopResult>
export type ShopAddressResponse = ApiResponse<ShopAddress>
export type GHNStatusResponse = ApiResponse<GHNStatus>


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

  getShopAddress: async (): Promise<ShopAddressResponse> => {
    const { data } = await apiClient.get<ShopAddressResponse>("/shop/address/me");
    return data;
  },

  setShopAddress: async (payload: ShopAddressPayload): Promise<ShopAddressResponse> => {
    const { data } = await apiClient.post<ShopAddressResponse>(
      "/shop/address/me",
      payload
    );
    return data;
  },

  updateShopAddress: async (addressId: number, payload: ShopAddressPayload): Promise<ShopAddressResponse> => {
    const { data } = await apiClient.put<ShopAddressResponse>(
      `/shop/address/me/${addressId}`,
      payload
    );
    return data;
  },

  getGHNStatus: async (): Promise<GHNStatusResponse> => {
    const { data } = await apiClient.get<GHNStatusResponse>("/shop/address/me/ghn/status");
    return data;
  },

  connectGHN: async (payload: GHNConnectPayload): Promise<GHNStatusResponse> => {
    const { data } = await apiClient.post<GHNStatusResponse>(
      "/shop/address/me/ghn/connect",
      payload
    );
    return data;
  },
};

