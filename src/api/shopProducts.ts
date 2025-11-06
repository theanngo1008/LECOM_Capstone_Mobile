import { ApiResponse } from "../types/common";
import { apiClient } from "./client";

export interface ShopProductImage {
  url: string;
  orderIndex: number;
  isPrimary: boolean;
}

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  status: "Draft" | "Published" | "OutOfStock" | "Archived";
  lastUpdatedAt: string;
  images: ShopProductImage[];
  thumbnailUrl: string;
  shopId: number;
  shopName: string;
  shopAvatar: string;
  shopDescription: string;
}

// Payload để tạo sản phẩm
export interface CreateProductPayload {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  stock: number;
  status: "Draft" | "Published" | "OutOfStock" | "Archived";
  images: ShopProductImage[];
}

// Payload để update sản phẩm
export interface UpdateProductPayload {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  stock: number;
  status: "Draft" | "Published" | "OutOfStock" | "Archived";
  images: ShopProductImage[];
}

export type ShopProductsResponse = ApiResponse<ShopProduct[]>;
export type UpdateProductStatusResponse = ApiResponse<ShopProduct>;
export type CreateProductResponse = ApiResponse<ShopProduct>;
export type GetProductByIdResponse = ApiResponse<ShopProduct>;
export type UpdateProductResponse = ApiResponse<ShopProduct>;

export const shopProductsApi = {
  getMyProducts: async (): Promise<ShopProductsResponse> => {
    const { data } = await apiClient.get<ShopProductsResponse>("/seller/products");
    return data;
  },

  getProductById: async (productId: string): Promise<GetProductByIdResponse> => {
    const { data } = await apiClient.get<GetProductByIdResponse>(`/seller/products/by-id/${productId}`);
    return data;
  },

  updateProduct: async (productId: string, payload: UpdateProductPayload): Promise<UpdateProductResponse> => {
    const { data } = await apiClient.put<UpdateProductResponse>(
      `/seller/products/${productId}`,
      payload
    );
    return data;
  },

  updateProductStatus: async (
    productId: string,
    status: "Draft" | "Published" | "OutOfStock" | "Archived"
  ): Promise<UpdateProductStatusResponse> => {
    const { data } = await apiClient.put<UpdateProductStatusResponse>(
      `/seller/products/${productId}/status`,
      { status }
    );
    return data;
  },

  deleteProduct: async (productId: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/seller/products/${productId}`
    );
    return data;
  },

  createProduct: async (payload: CreateProductPayload): Promise<CreateProductResponse> => {
    const { data } = await apiClient.post<CreateProductResponse>(
      "/seller/products",
      payload
    );
    return data;
  },
};
