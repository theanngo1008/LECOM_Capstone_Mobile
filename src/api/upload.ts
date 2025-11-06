import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// Kết quả upload trả về từ server
export interface UploadResult {
  url: string
  publicId: string
}

export type UploadResponse = ApiResponse<UploadResult>

export const uploadApi = {
  // Upload ảnh (avatar, banner, sản phẩm)
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const { data } = await apiClient.post<UploadResponse>("/Upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  // Upload file tài liệu
  uploadDocument: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const { data } = await apiClient.post<UploadResponse>("/Upload/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  // Upload video
  uploadVideo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const { data } = await apiClient.post<UploadResponse>("/Upload/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },
}
