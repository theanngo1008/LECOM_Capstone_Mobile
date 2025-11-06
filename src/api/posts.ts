import { apiClient } from "./client";

// Type definitions
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PostsResponse {
  posts: Post[];
  nextPage?: number;
  totalCount: number;
}

export interface CreatePostInput {
  userId: number;
  title: string;
  body: string;
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
}

// API Functions
export const postsApi = {
  /**
   * GET /posts?_page=1&_limit=10
   * Lấy danh sách posts với phân trang
   */
  getPosts: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PostsResponse> => {
    const { data, headers } = await apiClient.get<Post[]>("/posts", {
      params: {
        _page: page,
        _limit: limit,
      },
    });

    // JSONPlaceholder trả total count trong header
    const totalCount = parseInt(headers["x-total-count"] || "100");
    const hasMore = page * limit < totalCount;

    return {
      posts: data,
      nextPage: hasMore ? page + 1 : undefined,
      totalCount,
    };
  },

  /**
   * GET /posts/:id
   * Lấy chi tiết một post
   */
  getPost: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get<Post>(`/posts/${id}`);
    return data;
  },

  /**
   * POST /posts
   * Tạo post mới
   */
  createPost: async (input: CreatePostInput): Promise<Post> => {
    const { data } = await apiClient.post<Post>("/posts", input);
    return data;
  },

  /**
   * PUT /posts/:id
   * Cập nhật post
   */
  updatePost: async (id: number, input: UpdatePostInput): Promise<Post> => {
    const { data } = await apiClient.put<Post>(`/posts/${id}`, input);
    return data;
  },

  /**
   * DELETE /posts/:id
   * Xóa post
   */
  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  /**
   * GET /posts?userId=:userId
   * Lấy posts của một user
   */
  getPostsByUser: async (userId: number): Promise<Post[]> => {
    const { data } = await apiClient.get<Post[]>("/posts", {
      params: { userId },
    });
    return data;
  },
};
