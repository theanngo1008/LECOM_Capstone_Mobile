import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// =========================
// TYPES
// =========================

export interface Province {
  ProvinceID: number
  ProvinceName: string
  Code: string
}

export interface District {
  DistrictID: number
  ProvinceID: number
  DistrictName: string
  Code: string
}

export interface Ward {
  WardCode: string
  DistrictID: number
  WardName: string
}

export type ProvinceListResponse = ApiResponse<Province[]>
export type DistrictListResponse = ApiResponse<District[]>
export type WardListResponse = ApiResponse<Ward[]>

// =========================
// API MODULE
// =========================

export const shippingApi = {
  getProvinces: async (): Promise<ProvinceListResponse> => {
    const { data } = await apiClient.get<ProvinceListResponse>("/shipping/provinces")
    return data
  },

  getDistricts: async (provinceId: number): Promise<DistrictListResponse> => {
    const { data } = await apiClient.get<DistrictListResponse>(`/shipping/districts/${provinceId}`)
    return data
  },

  getWards: async (districtId: number): Promise<WardListResponse> => {
    const { data } = await apiClient.get<WardListResponse>(`/shipping/wards/${districtId}`)
    return data
  },
}

