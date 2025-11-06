# 🚀 Code Thực Hành Buổi 3: TanStack Query + Axios - Posts App Demo

## 📋 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt Dependencies](#cài-đặt-dependencies)
3. [Tạo API Layer với Axios](#tạo-api-layer-với-axios)
4. [Setup React Query](#setup-react-query)
5. [Tạo Custom Hooks](#tạo-custom-hooks)
6. [Tạo Components](#tạo-components)
7. [Tạo Screens](#tạo-screens)
8. [Cập nhật Navigation](#cập-nhật-navigation)
9. [Demo Features](#demo-features)
10. [Bonus: Zustand Integration](#bonus-zustand-integration)

---

## Giới thiệu

Trong bài thực hành này, chúng ta sẽ xây dựng một ứng dụng **Posts** đầy đủ với:

- ✅ **TanStack Query** - Quản lý server state
- ✅ **Axios** - HTTP client với interceptors
- ✅ **Infinite Scroll (Pagination)** - Phân trang tự động load more
- ✅ **Cache Management** - Tối ưu hiệu suất, giảm refetch
- ✅ **Optimistic Updates** - UI phản hồi tức thì
- ✅ **Search Posts** - Tìm kiếm client-side real-time
- ✅ **Pull-to-Refresh** - Refetch manual
- ✅ **NativeWind** - Styling với Tailwind CSS
- ✅ **TypeScript** - Type safety
- ✅ **Local Posts Pattern** - ID âm cho posts demo
- ✅ **Zustand** - Quản lý bookmark (bonus)

**API sử dụng:** [JSONPlaceholder](https://jsonplaceholder.typicode.com/)

**⚠️ LƯU Ý QUAN TRỌNG VỀ FAKE API:**

JSONPlaceholder là fake API, không lưu data thực sự. Behavior:

- ✅ **Có 100 posts** (ID: 1-100)
- ✅ **Create POST** trả về ID > 100 (ID 101, 102...) - **KHÔNG tồn tại thật**
- ✅ **GET /posts/101** → **404 Error** (vì chỉ có 1-100)
- ✅ **DELETE** không xóa thật trên server

**Giải pháp trong code:**

- ✅ Dùng **ID âm** (-timestamp) cho local posts để phân biệt
- ✅ **Chặn navigation** vào local posts (hiển thị alert thay vì 404)
- ✅ **Visual indicator** "Local" badge màu cam cho posts demo
- ✅ **Manual cache update** thay vì refetch để giữ consistency
- ✅ Local posts **chỉ hiển thị trong session**, mất khi reload app

---

## Cài đặt Dependencies

### Bước 1: Mở terminal và chạy lệnh

```bash
npm install @tanstack/react-query axios
```

**Giải thích:**

- `@tanstack/react-query`: Thư viện quản lý server state
- `axios`: HTTP client mạnh mẽ hơn fetch

---

## Tạo API Layer với Axios

### Bước 1: Tạo folder `api`

Trong `src/`, tạo folder mới:

```
src/
├── api/              # 🆕 Folder mới
│   ├── client.ts
│   └── posts.ts
```

### Bước 2: Tạo file `src/api/client.ts`

**Mục đích:** Cấu hình Axios instance với interceptors

```typescript
import axios from "axios";

// Tạo instance với config mặc định
export const apiClient = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 10000, // 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Log mỗi request
apiClient.interceptors.request.use(
  (config) => {
    console.log("📤 API Request:", config.method?.toUpperCase(), config.url);
    // Có thể thêm token vào đây
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Log response hoặc xử lý lỗi global
apiClient.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", error.response?.status, error.message);

    // Xử lý lỗi global
    if (error.response?.status === 401) {
      // Redirect to login
      console.log("Unauthorized - Please login");
    }

    return Promise.reject(error);
  }
);
```

**Giải thích:**

- `baseURL`: URL gốc cho tất cả requests
- `timeout`: Timeout sau 10 giây
- `interceptors.request`: Chạy trước mỗi request (thêm token, log, etc.)
- `interceptors.response`: Xử lý response (log, error handling)

### Bước 3: Tạo file `src/api/posts.ts`

**Mục đích:** Định nghĩa tất cả API endpoints cho Posts

```typescript
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
```

**Giải thích:**

- Interface `Post`: Type cho dữ liệu post
- Interface `PostsResponse`: Type cho response phân trang
- `getPosts`: Hỗ trợ phân trang với `_page` và `_limit`
- `getPost`: Lấy chi tiết 1 post
- CRUD operations: Create, Read, Update, Delete

---

## Setup React Query

### Bước 1: Tạo folder `lib`

```
src/
├── lib/              # 🆕 Folder mới
│   └── queryClient.ts
```

### Bước 2: Tạo file `src/lib/queryClient.ts`

**Mục đích:** Cấu hình React Query client với pagination optimization

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Thời gian data được coi là "fresh" (tươi mới)
      staleTime: 2 * 60 * 1000, // 2 phút (tăng để giảm refetch không cần thiết)

      // Thời gian giữ data trong cache khi inactive
      gcTime: 5 * 60 * 1000, // 5 phút (trước đây là cacheTime)

      // Retry khi fetch thất bại (giảm để tránh spam API)
      retry: 2,

      // Delay giữa các lần retry (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch khi window focus
      refetchOnWindowFocus: false,

      // Refetch khi reconnect (tắt để tránh refetch liên tục)
      refetchOnReconnect: false,

      // Refetch khi mount (tắt, dùng manual refetch)
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutation 1 lần nếu thất bại
      retry: 1,
    },
  },
});
```

**Giải thích các options:**

| Option                 | Giá trị     | Ý nghĩa                                                |
| ---------------------- | ----------- | ------------------------------------------------------ |
| `staleTime`            | 2 phút      | Data tươi trong 2 phút, không refetch (tăng để tối ưu) |
| `gcTime`               | 5 phút      | Giữ data trong cache 5 phút sau khi inactive           |
| `retry`                | 2           | Thử lại 2 lần nếu fetch thất bại (giảm để tránh spam)  |
| `retryDelay`           | Exponential | Delay tăng dần: 1s, 2s, 4s, 8s...                      |
| `refetchOnWindowFocus` | false       | Không refetch khi app focus (di động)                  |
| `refetchOnReconnect`   | false       | Không refetch khi reconnect (tránh refetch liên tục)   |
| `refetchOnMount`       | false       | Dùng manual refetch thay vì tự động                    |

### Bước 3: Cập nhật `App.tsx`

**Đường dẫn:** Root folder

Wrap app với `QueryClientProvider`:

```tsx
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useTheme } from "./src/hooks/use-theme";
import { queryClient } from "./src/lib/queryClient";
import "./global.css";

export default function App() {
  const { isDark } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <RootNavigator />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
```

**Giải thích:**

- `QueryClientProvider`: Cung cấp queryClient cho toàn bộ app
- Đặt ở ngoài cùng, bao bọc tất cả components

---

## Tạo Custom Hooks

### Bước 1: Tạo folder structure cho Posts feature

```
src/
├── features/
│   └── posts/        # 🆕 Feature mới
│       ├── hooks/
│       │   ├── usePosts.ts
│       │   ├── usePost.ts
│       │   ├── useCreatePost.ts
│       │   └── useDeletePost.ts
│       ├── components/
│       └── screens/
```

### Bước 2: Tạo file `src/features/posts/hooks/usePosts.ts`

**Mục đích:** Hook cho danh sách posts với infinite scroll

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";

// Query Key Factory - Quản lý keys tập trung
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (limit: number) => [...postKeys.lists(), { limit }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  byUser: (userId: number) => [...postKeys.all, "byUser", userId] as const,
};

/**
 * Hook lấy danh sách posts với infinite scroll
 */
export function usePosts() {
  return useInfiniteQuery({
    // Query key - duy nhất cho query này
    queryKey: postKeys.lists(),

    // Query function - hàm fetch dữ liệu với pageParam
    queryFn: ({ pageParam = 1 }) => postsApi.getPosts(pageParam, 10),

    // Lấy page tiếp theo từ response
    getNextPageParam: (lastPage) => lastPage.nextPage,

    // Page đầu tiên
    initialPageParam: 1,

    // Giữ data cũ khi fetch page mới (better UX)
    placeholderData: (previousData) => previousData,

    // Cấu hình bổ sung
    staleTime: 3 * 60 * 1000, // 3 phút (posts ít thay đổi)
    retry: 1, // Giảm retry cho infinite query
  });
}
```

**Giải thích:**

- `postKeys`: Factory pattern cho query keys, dễ quản lý và invalidate
- `useInfiniteQuery`: Hook chuyên cho infinite scroll
- `pageParam`: Tự động tăng khi gọi `fetchNextPage()`
- `getNextPageParam`: Trả về page tiếp theo hoặc `undefined` (hết data)

### Bước 3: Tạo file `src/features/posts/hooks/usePost.ts`

**Mục đích:** Hook cho chi tiết một post

```typescript
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { postKeys } from "./usePosts";

/**
 * Hook lấy chi tiết một post
 * @param id - ID của post
 * @param enabled - Điều kiện để fetch (default: true)
 */
export function usePost(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.getPost(id),

    // ⚠️ KHÔNG fetch nếu:
    // - enabled = false
    // - id âm (local post không tồn tại trên server)
    // - id không hợp lệ
    enabled: enabled && id > 0 && !!id,

    // Stale time dài hơn vì detail ít thay đổi
    staleTime: 5 * 60 * 1000, // 5 phút

    // Giảm retry để tránh spam API khi 404
    retry: 1,
  });
}
```

**Giải thích:**

- `enabled`: Điều kiện để query chạy (dependent query)
- Chỉ fetch khi có `id` hợp lệ

### Bước 4: Tạo file `src/features/posts/hooks/useCreatePost.ts`

**Mục đích:** Hook tạo post mới với optimistic update

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, CreatePostInput, Post } from "@/api/posts";
import { postKeys } from "./usePosts";
import { Alert } from "react-native";

/**
 * Hook tạo post mới
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => postsApi.createPost(input),

    // ========== OPTIMISTIC UPDATE ==========
    onMutate: async (newPost) => {
      // 1. Hủy các query đang chạy để tránh ghi đè
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // 2. Snapshot data cũ để rollback nếu lỗi
      const previousPosts = queryClient.getQueryData(postKeys.list(10));

      // 3. Optimistically update cache
      queryClient.setQueryData(postKeys.lists(), (old: any) => {
        if (!old) return old;

        // ⚠️ Dùng ID âm để phân biệt local posts
        // JSONPlaceholder trả ID > 100 (không tồn tại) → 404 khi navigate
        const optimisticPost: Post = {
          id: -Date.now(), // ID âm = Local post (không fetch detail được)
          userId: newPost.userId,
          title: newPost.title,
          body: newPost.body,
        };

        return {
          ...old,
          pages: [
            {
              posts: [optimisticPost, ...old.pages[0].posts],
              nextPage: old.pages[0].nextPage,
              totalCount: old.pages[0].totalCount + 1,
            },
            ...old.pages.slice(1),
          ],
        };
      });

      // 4. Trả về context để rollback
      return { previousPosts };
    },

    // Server response - KHÔNG replace cache
    onSuccess: (serverPost) => {
      console.log("✅ Server returned post:", serverPost);

      // JSONPlaceholder trả ID > 100 (không tồn tại thật trên server)
      // Navigate vào /posts/101 sẽ bị 404
      // → Giữ post với ID âm trong cache, KHÔNG replace

      Alert.alert(
        "Thành công",
        "Tạo bài viết mới thành công! 🎉\n\n⚠️ Lưu ý: Đây là demo API, post chỉ hiển thị trong app.",
        [{ text: "OK" }]
      );
    },

    // Rollback nếu mutation thất bại
    onError: (error, newPost, context) => {
      console.error("❌ Create post failed:", error);

      // Khôi phục data cũ
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }

      Alert.alert("Lỗi", "Không thể tạo bài viết. Vui lòng thử lại.");
    },

    // KHÔNG invalidate để giữ post mới
    // JSONPlaceholder API không lưu data thật nên không cần refetch
    onSettled: () => {
      console.log("✅ Post created - cache updated manually");
    },
  });
}
```

**Giải thích Optimistic Update Flow:**

1. `onMutate`: Chạy TRƯỚC khi gửi request
   - Cancel queries đang chạy
   - Lưu snapshot để rollback
   - Update cache ngay lập tức với fake ID
2. `onSuccess`: Server trả về post thật → Replace fake post với real post
3. `onError`: Nếu thất bại → rollback về snapshot
4. `onSettled`: Không refetch vì API fake

**⚠️ LƯU Ý:**

- Thay vì `invalidateQueries` (refetch), ta dùng **manual cache update**
- JSONPlaceholder không lưu data thật, nên refetch sẽ mất post mới
- Cách này giữ post mới hiển thị cho đến khi user reload app

### Bước 5: Tạo file `src/features/posts/hooks/useDeletePost.ts`

**Mục đích:** Hook xóa post với manual cache update

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { postsApi } from "../../../api/posts";
import { postKeys } from "./usePosts";

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postsApi.deletePost(id),

    onSuccess: (_data, deletedId) => {
      // 1. Xóa detail cache của post này
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) });

      // 2. Update cache manually (không refetch vì API fake)
      queryClient.setQueriesData({ queryKey: postKeys.lists() }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((post: any) => post.id !== deletedId),
            totalCount: page.totalCount - 1,
          })),
        };
      });

      Alert.alert("Thành công", "Đã xóa bài viết! 🗑️");
    },

    onError: (error) => {
      Alert.alert("Lỗi", "Không thể xóa bài viết. Vui lòng thử lại.");
      console.error("Delete post error:", error);
    },
  });
};
```

**Giải thích:**

- `setQueriesData`: Update tất cả queries matching pattern
- `filter`: Xóa post khỏi mọi pages trong cache
- **Không dùng `invalidateQueries`** vì sẽ refetch và post xuất hiện lại (API fake)
- Dùng manual cache update để consistency với Create

---

## Tạo Components

### Bước 1: Tạo folder components

```
src/
├── features/
│   └── posts/
│       ├── components/    # 🆕
│       │   ├── PostCard.tsx
│       │   ├── PostSkeleton.tsx
│       │   └── CreatePostModal.tsx
```

### Bước 2: Tạo file `src/features/posts/components/PostCard.tsx`

**Mục đích:** Component hiển thị một post trong list với visual indicator cho local posts

```tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Post } from "../../../api/posts";

interface PostCardProps {
  post: Post;
  onPress: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const isLocalPost = post.id < 0; // Local post (chưa sync server)

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white rounded-xl p-4 mb-3 mx-4 shadow-sm border ${
        isLocalPost ? "border-orange-300 bg-orange-50" : "border-gray-100"
      }`}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <View
          className={`w-8 h-8 rounded-full ${
            isLocalPost ? "bg-orange-500" : "bg-blue-500"
          } items-center justify-center`}
        >
          <Text className="text-white font-bold text-sm">{post.userId}</Text>
        </View>
        <Text className="ml-2 text-gray-500 text-xs">User {post.userId}</Text>
        {isLocalPost && (
          <View className="ml-auto bg-orange-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Local</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        className="text-gray-900 font-semibold text-base mb-2"
        numberOfLines={2}
      >
        {post.title}
      </Text>

      {/* Body preview */}
      <Text className="text-gray-600 text-sm" numberOfLines={3}>
        {post.body}
      </Text>

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <Text className="text-gray-400 text-xs">ID: {post.id}</Text>
        <Text className="text-blue-500 text-xs font-medium">
          Xem chi tiết →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

```

**Giải thích:**

- `isLocalPost = post.id < 0`: Phát hiện local posts (ID âm)
- `border-orange-300 bg-orange-50`: Style khác biệt cho local posts
- `"Local" badge`: Visual indicator rõ ràng
- `bg-orange-500` vs `bg-blue-500`: Màu avatar khác biệt

**⚠️ Why Local Posts?**

```
JSONPlaceholder POST /posts → trả về ID 101
Nhưng GET /posts/101 → 404 (chỉ có 1-100)
→ Dùng ID âm (-timestamp) để tránh conflict
→ Chặn navigation vào local posts ở screen level
```

### Bước 3: Tạo file `src/features/posts/components/PostSkeleton.tsx`

**Mục đích:** Loading skeleton cho better UX

```tsx
import React from "react";
import { View } from "react-native";

export function PostSkeleton() {
  return (
    <View className="bg-light-card dark:bg-dark-card mx-4 mb-3 p-4 rounded-xl border border-light-border dark:border-dark-border">
      {/* Title skeleton */}
      <View className="h-4 bg-light-border dark:bg-dark-border rounded w-3/4 mb-3" />

      {/* Body skeletons */}
      <View className="h-3 bg-light-border dark:bg-dark-border rounded w-full mb-2" />
      <View className="h-3 bg-light-border dark:bg-dark-border rounded w-5/6 mb-2" />
      <View className="h-3 bg-light-border dark:bg-dark-border rounded w-4/5 mb-3" />

      {/* Footer skeleton */}
      <View className="flex-row items-center justify-between">
        <View className="h-3 bg-light-border dark:bg-dark-border rounded w-20" />
        <View className="h-6 bg-light-border dark:bg-dark-border rounded w-16" />
      </View>
    </View>
  );
}

// Skeleton List Component
export function PostSkeletonList() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  );
}
```

**Giải thích:**

- Dùng `View` với background color để tạo skeleton
- Match layout với `PostCard`
- `PostSkeletonList`: Hiển thị nhiều skeletons

### Bước 4: Tạo file `src/features/posts/components/CreatePostModal.tsx`

**Mục đích:** Modal tạo post mới

```tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useCreatePost } from "../hooks/useCreatePost";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const createPost = useCreatePost();

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    createPost.mutate(
      {
        userId: 1, // Mock user ID
        title: title.trim(),
        body: body.trim(),
      },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-light-background dark:bg-dark-background rounded-t-3xl"
        >
          <ScrollView className="max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Tạo bài viết mới
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text className="text-2xl text-light-textSecondary dark:text-dark-textSecondary">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="p-6 gap-4">
              {/* Title Input */}
              <View>
                <Text className="text-sm font-semibold mb-2 text-light-text dark:text-dark-text">
                  Tiêu đề
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nhập tiêu đề bài viết..."
                  placeholderTextColor="#9CA3AF"
                  className="border border-light-border dark:border-dark-border rounded-xl px-4 py-3 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text"
                />
              </View>

              {/* Body Input */}
              <View>
                <Text className="text-sm font-semibold mb-2 text-light-text dark:text-dark-text">
                  Nội dung
                </Text>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="Nhập nội dung bài viết..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="border border-light-border dark:border-dark-border rounded-xl px-4 py-3 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text min-h-[120px]"
                />
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-light-border dark:bg-dark-border rounded-xl py-3 items-center"
                >
                  <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={createPost.isPending}
                  className={`flex-1 bg-primary-light dark:bg-primary-dark rounded-xl py-3 items-center ${
                    createPost.isPending ? "opacity-50" : ""
                  }`}
                >
                  <Text className="text-base font-semibold text-white">
                    {createPost.isPending ? "Đang tạo..." : "Tạo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
```

**Giải thích:**

- `Modal`: Fullscreen overlay
- `KeyboardAvoidingView`: Tránh keyboard che input
- `createPost.mutate()`: Trigger mutation
- `onSuccess`: Callback sau khi tạo thành công

---

## Tạo Screens

### Bước 1: Tạo folder screens

```
src/
├── features/
│   └── posts/
│       ├── screens/       # 🆕
│       │   ├── PostListScreen.tsx
│       │   └── PostDetailScreen.tsx
```

### Bước 2: Tạo file `src/features/posts/screens/PostListScreen.tsx`

**Mục đích:** Màn hình danh sách posts với infinite scroll + search

```tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PostsStackParamList } from '../../../navigation/types';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/PostSkeleton';
import { CreatePostModal } from '../components/CreatePostModal';

type Props = NativeStackScreenProps<PostsStackParamList, 'PostList'>;

export const PostListScreen: React.FC<Props> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePosts();

  // Flatten all pages
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Filter posts by search query
  const posts = useMemo(() => {
    if (!searchQuery.trim()) return allPosts;

    const query = searchQuery.toLowerCase();
    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        post.id.toString().includes(query)
    );
  }, [allPosts, searchQuery]);

  // Loading state (lần đầu)
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-red-500 text-6xl mb-4">😞</Text>
        <Text className="text-gray-900 font-semibold text-xl mb-2 text-center">
          Có lỗi xảy ra
        </Text>
        <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-4">
          Vui lòng kiểm tra kết nối mạng
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-primary-light dark:bg-primary-dark px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Text className="text-xl mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm bài viết..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-gray-900 text-base"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-gray-400 text-xl ml-2">✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text className="text-gray-500 text-sm mt-2">
            {posts.length} kết quả tìm thấy
          </Text>
        )}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => {
              // ⚠️ Chặn navigate vào local posts (ID âm)
              if (item.id < 0) {
                Alert.alert(
                  'Bài viết local',
                  'Đây là bài viết demo (chưa có trên server). Chỉ xem được danh sách.',
                  [{ text: 'OK' }]
                );
                return;
              }
              navigation.navigate('PostDetail', { postId: item.id });
            }}
          />
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}

        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }

        // Infinite scroll (chỉ khi không search)
        onEndReached={() => {
          if (!searchQuery && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }

        // Infinite scroll (chỉ khi không search)
        onEndReached={() => {
          if (!searchQuery && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}

        // Footer loading
        ListFooterComponent={() => {
          if (isFetchingNextPage) {
            return (
              <View className="py-4">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            );
          }

          if (!hasNextPage && posts.length > 0 && !searchQuery) {
            return (
              <View className="py-4">
                <Text className="text-center text-gray-400 text-sm">
                  🎉 Đã tải hết dữ liệu
                </Text>
              </View>
            );
          }

          return null;
        }}

        // Empty search result
        ListEmptyComponent={() => {
          if (searchQuery) {
            return (
              <View className="py-20 items-center">
                <Text className="text-gray-400 text-6xl mb-4">�</Text>
                <Text className="text-gray-900 font-semibold text-lg mb-2">
                  Không tìm thấy kết quả
                </Text>
                <Text className="text-gray-500 text-center px-6">
                  Không có bài viết nào khớp với "{searchQuery}"
                </Text>
              </View>
            );
          }
          return null;
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};
```

**Giải thích:**

- `useMemo`: Cache filtered results, chỉ recompute khi `allPosts` hoặc `searchQuery` thay đổi
- `searchQuery`: State lưu từ khóa tìm kiếm
- `filter`: Tìm theo title, body, hoặc ID
- `ListEmptyComponent`: Hiển thị "Không tìm thấy" khi search không có kết quả
- Infinite scroll **tắt khi đang search** (không load more pages khi filter)
- Search hoạt động **client-side** trên data đã cache

### Bước 3: Tạo file `src/features/posts/screens/PostDetailScreen.tsx`

**Mục đích:** Màn hình chi tiết một post

```tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePost } from "../hooks/usePost";
import { useDeletePost } from "../hooks/useDeletePost";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any, "PostDetail">;

export function PostDetailScreen({ route, navigation }: Props) {
  const { postId } = route.params;

  // Fetch post detail
  const { data: post, isLoading, isError } = usePost(postId);

  // Delete mutation
  const deletePost = useDeletePost();

  const handleDelete = () => {
    if (confirm(`Xóa bài viết này?`)) {
      deletePost.mutate(postId, {
        onSuccess: () => {
          navigation.goBack();
        },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Đang tải...
        </Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError || !post) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background items-center justify-center px-6">
        <Text className="text-6xl mb-4">😢</Text>
        <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
          Không tìm thấy bài viết
        </Text>
        <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
          Bài viết có thể đã bị xóa hoặc không tồn tại
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-primary-light dark:bg-primary-dark px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 border-b border-light-border dark:border-dark-border">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                {post.title}
              </Text>
            </View>
            <View className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1 rounded-lg">
              <Text className="text-sm font-bold text-primary-light dark:text-primary-dark">
                #{post.id}
              </Text>
            </View>
          </View>

          {/* Meta */}
          <View className="flex-row items-center">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              👤 User {post.userId}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View className="p-6">
          <Text className="text-base leading-7 text-light-text dark:text-dark-text">
            {post.body}
          </Text>
        </View>

        {/* Actions */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deletePost.isPending}
            className={`bg-red-500 py-4 rounded-xl items-center ${
              deletePost.isPending ? "opacity-50" : ""
            }`}
          >
            <Text className="text-white font-bold">
              {deletePost.isPending ? "Đang xóa..." : "🗑️ Xóa bài viết"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Giải thích:**

- `usePost(postId)`: Fetch detail dựa trên ID từ route params
- Cache: Nếu đã fetch ở list, sẽ hiển thị instant từ cache
- Delete: Navigate back sau khi xóa thành công

---

## Cập nhật Navigation

### Bước 1: Update `src/navigation/types.ts`

Thêm Posts screens vào navigation types:

```typescript
// ... existing code ...

// ==============================================
// POSTS STACK (NEW)
// ==============================================
export type PostsStackParamList = {
  PostList: undefined;
  PostDetail: {
    postId: number;
  };
};

export type PostsStackScreenProps<T extends keyof PostsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<PostsStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

// Update MainTabParamList
export type MainTabParamList = {
  Home: undefined;
  PostsStack: undefined; // 🆕 Thêm vào
  CoursesStack: undefined;
  ProfileStack: undefined;
};

// ... existing code ...
```

### Bước 2: Tạo file `src/navigation/PostsStackNavigator.tsx`

```tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PostsStackParamList } from "./types";
import { PostListScreen } from "@/features/posts/screens/PostListScreen";
import { PostDetailScreen } from "@/features/posts/screens/PostDetailScreen";

const Stack = createNativeStackNavigator<PostsStackParamList>();

export function PostsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Custom header in screens
      }}
    >
      <Stack.Screen name="PostList" component={PostListScreen} />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerShown: true,
          title: "Chi tiết bài viết",
          headerBackTitle: "Quay lại",
        }}
      />
    </Stack.Navigator>
  );
}
```

### Bước 3: Update `src/navigation/MainTabNavigator.tsx`

Thêm Posts tab:

```tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { PostsStackNavigator } from "./PostsStackNavigator"; // 🆕
import { CoursesStackNavigator } from "./CoursesStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
        }}
      />

      {/* 🆕 Posts Tab */}
      <Tab.Screen
        name="PostsStack"
        component={PostsStackNavigator}
        options={{
          title: "Bài viết",
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📝</span>,
        }}
      />

      <Tab.Screen
        name="CoursesStack"
        component={CoursesStackNavigator}
        options={{
          title: "Khóa học",
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📚</span>,
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
}
```

---

## Demo Features

### 1. Cache Demo

**Mục đích:** Cho học trò thấy caching hoạt động

**Các bước:**

1. Mở app → Navigate to Posts tab
2. Scroll qua vài posts → Click vào một post
3. **Quan sát:** Detail hiển thị instant (từ cache)
4. Back về list → Click post khác
5. **Quan sát:** Instant loading
6. Tắt app 30s → Mở lại
7. **Quan sát:** Data vẫn còn (persist cache)

**Giải thích cho học trò:**

```
✅ Lần 1: Fetch từ API → Lưu vào cache
✅ Lần 2: Lấy từ cache → Instant
✅ Background refetch → Update nếu có data mới
```

### 2. Infinite Scroll Pagination Demo 📄

**Mục đích:** Demo phân trang tự động với `useInfiniteQuery`

**Các bước:**

1. Mở Posts list → Hiển thị 10 posts đầu (page 1)
2. Scroll xuống cuối list
3. **Quan sát:**
   - Auto fetch page 2 (10 posts tiếp theo)
   - Spinner "Loading..." hiển thị ở footer
   - Posts được append vào list hiện tại
4. Tiếp tục scroll → Load page 3, 4, 5...
5. Cuối cùng (page 10, tổng 100 posts): "🎉 Đã tải hết dữ liệu"

**Flow hoạt động:**

```
User scroll đến 50% cuối list (onEndReachedThreshold: 0.5)
    ↓
Check: hasNextPage = true? (có page tiếp không?)
    ↓
Check: isFetchingNextPage = false? (không đang fetch?)
    ↓
Gọi fetchNextPage()
    ↓
useInfiniteQuery fetch: postsApi.getPosts(pageParam, 10)
    ↓
Server response: { posts: [...], nextPage: 3, totalCount: 100 }
    ↓
getNextPageParam return: lastPage.nextPage (hoặc undefined nếu hết)
    ↓
Append posts vào data.pages array
    ↓
UI update với data mới
```

**Code highlight:**

```tsx
// usePosts hook - useInfiniteQuery
export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: postKeys.lists(),
    queryFn: ({ pageParam = 1 }) => postsApi.getPosts(pageParam, 10),
    getNextPageParam: (lastPage) => lastPage.nextPage, // ✅ Trả page tiếp
    initialPageParam: 1, // ✅ Page đầu tiên
    placeholderData: (previousData) => previousData, // ✅ Giữ data cũ
  });
};

// PostListScreen - FlatList config
<FlatList
  data={posts}
  onEndReached={() => {
    if (!searchQuery && hasNextPage && !isFetchingNextPage) {
      fetchNextPage(); // ✅ Auto load more khi scroll đến cuối
    }
  }}
  onEndReachedThreshold={0.5} // ✅ Trigger khi còn 50% cuối
  ListFooterComponent={() => {
    if (isFetchingNextPage) {
      return <ActivityIndicator size="large" color="#3B82F6" />;
    }
    if (!hasNextPage && posts.length > 0 && !searchQuery) {
      return <Text>🎉 Đã tải hết dữ liệu</Text>;
    }
    return null;
  }}
/>;
```

**Giải thích API Pagination:**

```typescript
// GET /posts?_page=1&_limit=10
const response = await apiClient.get<Post[]>("/posts", {
  params: {
    _page: page, // Trang hiện tại (1, 2, 3...)
    _limit: limit, // Số lượng mỗi page (10)
  },
});

// Response headers chứa metadata
const totalCount = parseInt(headers["x-total-count"] || "100"); // Tổng số posts
const hasMore = page * limit < totalCount; // page 1 * 10 < 100 → true

return {
  posts: data, // Array posts của page hiện tại
  nextPage: hasMore ? page + 1 : undefined, // Page tiếp: 2, 3... hoặc undefined
  totalCount, // 100
};
```

**Tối ưu Pagination:**

- ✅ **placeholderData**: Giữ data cũ khi fetch page mới → Không bị flash blank
- ✅ **staleTime: 3 phút**: Data tươi lâu → Không refetch nhiều lần
- ✅ **retry: 1**: Giảm retry cho infinite query → Tránh spam API
- ✅ **Disable khi search**: `!searchQuery` → Không load thêm khi đang filter client-side

### 3. Optimistic Update + Local Posts Demo

**Các bước:**

1. Click FAB "+" → Nhập title & body
2. Click "Đăng"
3. **Quan sát:**
   - Post xuất hiện **NGAY LẬP TỨC** với badge "Local" màu cam
   - Background màu cam nhạt (khác biệt)
   - Avatar màu cam
4. Try click vào local post
5. **Quan sát:** Alert "Bài viết local - chỉ xem được danh sách"
6. Check console: Server trả về post ID 101 (không tồn tại)

**Giải thích:**

```
User click "Đăng"
    ↓
Tạo post với ID âm (-timestamp)
    ↓
UI update ngay (Optimistic) → hiện badge "Local"
    ↓
Request gửi đến server
    ↓
Server trả ID 101 (fake - không tồn tại)
    ↓
KHÔNG replace cache (giữ ID âm)
    ↓
Alert warning về demo API
```

**⚠️ Why Local Posts với ID âm?**

```
Problem: JSONPlaceholder trả ID 101
         GET /posts/101 → 404 Error

Solution: Dùng ID âm (-timestamp)
         Navigate check: if (id < 0) → Block + Alert
         Visual: Badge "Local" màu cam

Result: Không có 404 errors! ✅
```

### 4. Manual Cache Update Demo

**Các bước:**

1. Vào detail một post
2. Click "Xóa bài viết"
3. **Quan sát:** Navigate back → Post biến mất khỏi list
4. **KHÔNG có refetch** - Manual cache update

**Code highlight:**

```tsx
onSuccess: (_, deletedId) => {
  // Update cache manually thay vì invalidate
  queryClient.setQueriesData({ queryKey: postKeys.lists() }, (old: any) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        posts: page.posts.filter((post: any) => post.id !== deletedId),
      })),
    };
  });
};
```

**⚠️ Why manual update?**

```
JSONPlaceholder = Fake API
  ↓
Delete không thật sự xóa trên server
  ↓
Nếu refetch → Post xuất hiện lại
  ↓
Manual cache update → Consistency với UI
```

### 5. Pull-to-Refresh Demo

**Các bước:**

1. Ở Posts list
2. Kéo xuống (pull down)
3. **Quan sát:** Spinner xuất hiện
4. Data refetch từ API
5. List update

**Code:**

```tsx
<RefreshControl
  refreshing={isFetching && !isFetchingNextPage}
  onRefresh={refetch}
/>
```

### 6. Search Posts Demo 🔍

**Mục đích:** Demo client-side search trên cached data

**Các bước:**

1. Ở Posts list, nhập từ khóa vào search bar
2. **Quan sát:** List tự động filter real-time
3. Thử search: "quis", "user", hoặc post ID "5"
4. **Quan sát:** Counter hiển thị số kết quả
5. Click "✕" để clear search

**Code highlight:**

```tsx
const posts = useMemo(() => {
  if (!searchQuery.trim()) return allPosts;

  const query = searchQuery.toLowerCase();
  return allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query) ||
      post.id.toString().includes(query)
  );
}, [allPosts, searchQuery]);
```

**Giải thích:**

- ✅ **Client-side search** - Không call API mỗi lần gõ
- ✅ **useMemo** - Cache kết quả, chỉ recompute khi cần
- ✅ **Real-time** - Filter instant khi user gõ
- ✅ **Search fields** - Title, Body, và ID
- ✅ **Empty state** - Hiển thị "Không tìm thấy" khi 0 results

**Why client-side search?**

```
✅ Instant feedback - Không delay network
✅ Reduce API calls - Tiết kiệm bandwidth
✅ Works offline - Vẫn search được trên cached data
✅ Better UX - Smooth, no loading spinners
```

---

## Bonus: Zustand Integration

### Mục đích

Demo sự khác biệt giữa:

- **Zustand**: UI state (bookmarks - client-side)
- **React Query**: Server state (posts - server-side)

### Bước 1: Tạo file `src/store/bookmark-store.ts`

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BookmarkState {
  bookmarkedIds: number[];
  toggleBookmark: (id: number) => void;
  isBookmarked: (id: number) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedIds: [],

      toggleBookmark: (id: number) =>
        set((state) => ({
          bookmarkedIds: state.bookmarkedIds.includes(id)
            ? state.bookmarkedIds.filter((i) => i !== id)
            : [...state.bookmarkedIds, id],
        })),

      isBookmarked: (id: number) => get().bookmarkedIds.includes(id),
    }),
    {
      name: "bookmarks-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Bước 2: Update `PostCard.tsx`

Thêm bookmark button:

```tsx
import { useBookmarkStore } from "@/store/bookmark-store";

export function PostCard({ post, onPress, onDelete }: PostCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const bookmarked = isBookmarked(post.id);

  return (
    <TouchableOpacity onPress={onPress} className="...">
      {/* ... existing code ... */}

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
            👤 User {post.userId}
          </Text>

          {/* Bookmark Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleBookmark(post.id);
            }}
            className="px-2 py-1"
          >
            <Text className="text-lg">{bookmarked ? "⭐" : "☆"}</Text>
          </TouchableOpacity>
        </View>

        {/* ... delete button ... */}
      </View>
    </TouchableOpacity>
  );
}
```

### Bước 3: Tạo Bookmarks Screen (Optional)

```tsx
// src/features/posts/screens/BookmarkedPostsScreen.tsx
import React from "react";
import { View, FlatList, Text } from "react-native";
import { useBookmarkStore } from "@/store/bookmark-store";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { PostCard } from "../components/PostCard";

export function BookmarkedPostsScreen({ navigation }) {
  const bookmarkedIds = useBookmarkStore((state) => state.bookmarkedIds);

  // Fetch posts by IDs
  const { data: posts, isLoading } = useQuery({
    queryKey: ["bookmarked-posts", bookmarkedIds],
    queryFn: async () => {
      const promises = bookmarkedIds.map((id) => postsApi.getPost(id));
      return Promise.all(promises);
    },
    enabled: bookmarkedIds.length > 0,
  });

  if (bookmarkedIds.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background dark:bg-dark-background">
        <Text className="text-4xl mb-4">⭐</Text>
        <Text className="text-lg font-semibold text-light-text dark:text-dark-text">
          Chưa có bookmark
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
        />
      )}
    />
  );
}
```

### Demo Zustand vs React Query

**Giải thích cho học trò:**

| Feature         | Zustand                    | React Query            |
| --------------- | -------------------------- | ---------------------- |
| **Data source** | Client (local)             | Server (API)           |
| **Persistence** | AsyncStorage               | Cache                  |
| **Example**     | Bookmarks, theme, UI state | Posts, users, API data |
| **Update**      | Synchronous                | Asynchronous           |
| **Network**     | ❌ No                      | ✅ Yes                 |

**Khi nào dùng gì:**

```tsx
// ✅ Zustand - UI/Client State
const { theme, setTheme } = useThemeStore();
const { bookmarkedIds } = useBookmarkStore();
const { cart } = useCartStore();

// ✅ React Query - Server State
const { data: posts } = usePosts();
const { data: user } = useUser();
const { data: products } = useProducts();
```

---

## 🎯 Tổng kết Demo

### Checklist hoàn thành

- [x] ✅ Cài đặt TanStack Query + Axios
- [x] ✅ Tạo API layer với interceptors
- [x] ✅ Setup QueryClient với config tối ưu (giảm refetch)
- [x] ✅ Tạo custom hooks (useQuery, useInfiniteQuery, useMutation)
- [x] ✅ Tạo PostCard với Local Posts indicator
- [x] ✅ Tạo Skeleton components
- [x] ✅ **Tạo PostListScreen với Infinite Scroll Pagination** 📄
- [x] ✅ Tạo PostDetailScreen
- [x] ✅ Implement Create Post với Optimistic Update (ID âm)
- [x] ✅ Implement Delete Post với Manual Cache Update
- [x] ✅ Thêm Pull-to-Refresh
- [x] ✅ **Search Posts với client-side filter** 🔍
- [x] ✅ **FIX 404 errors - Block fetch với ID âm** 🛡️
- [x] ✅ **FIX refetch liên tục - Config tối ưu** ⚡
- [ ] ⭕ Bonus: Zustand cho bookmarks (optional)

### ⚡ Performance Improvements

**Trước khi tối ưu:**

```
❌ GET /posts → 10 lần refetch liên tục
❌ GET /posts/101 → 404 Error (retry 4 lần)
❌ Data flash blank khi load page mới
❌ Refetch mỗi lần mount component
```

**Sau khi tối ưu:**

```
✅ GET /posts → 1 lần duy nhất khi cần
✅ GET /posts/101 → KHÔNG fetch (blocked với enabled)
✅ Data giữ nguyên khi load page mới (placeholderData)
✅ Cache 2-3 phút, không refetch không cần thiết
✅ Retry giảm từ 3 → 1-2 lần
```

**Metrics:**

| Metric             | Before    | After   | Improvement     |
| ------------------ | --------- | ------- | --------------- |
| API Calls on Mount | 10+       | 1       | 🔥 -90%         |
| 404 Errors         | 4 retries | 0       | 🎯 100%         |
| Refetch on Focus   | Yes       | No      | ⚡ Faster       |
| Stale Time         | 1 min     | 2-3 min | 📦 Better Cache |
| Retry Count        | 3         | 1-2     | 🚀 Less Spam    |

### Key Concepts Covered

1. **useQuery** - Fetch & cache data với enabled condition
2. **useInfiniteQuery** - Infinite scroll pagination với getNextPageParam
3. **useMutation** - Create/Update/Delete với optimistic updates
4. **Optimistic Updates** - Instant UI feedback với local posts (ID âm)
5. **Manual Cache Updates** - Update cache without refetch (cho fake API)
6. **Query Keys Factory** - Organize & manage cache keys theo pattern
7. **Client-side Search** - Filter với useMemo (không call API)
8. **Pagination Optimization** - placeholderData, staleTime, retry config
9. **Loading States** - Skeletons, spinners, empty states
10. **Error Handling** - Retry logic, error screens, 404 prevention
11. **Axios Interceptors** - Request/Response logging, auth headers
12. **Pull-to-Refresh** - RefreshControl integration
13. **Local Posts Pattern** - ID âm để phân biệt client-only data
14. **Navigation Guards** - Chặn navigation + fetch vào invalid posts
15. **Visual Indicators** - Badge "Local" cho demo posts
16. **Query Config Optimization** - Giảm refetch không cần thiết
17. **Zustand Integration** - Client state vs Server state (optional)

### Timeline Demo (90 phút)

| Thời gian  | Nội dung                                                             |
| ---------- | -------------------------------------------------------------------- |
| 0-10 phút  | Giới thiệu: Review TanStack Query concepts                           |
| 10-20 phút | Setup: Install packages, API layer với Axios                         |
| 20-30 phút | Setup: QueryClient config, wrap App                                  |
| 30-50 phút | Code: Custom hooks (usePosts, usePost, useCreatePost, useDeletePost) |
| 50-70 phút | Code: PostListScreen (Infinite Scroll + Search)                      |
| 70-75 phút | Code: PostDetailScreen, CreatePostModal                              |
| 75-85 phút | **Demo Live:** Cache, Optimistic Update, Search, Delete              |
| 85-90 phút | Q&A, Bonus: Zustand integration                                      |

**🎯 Mục tiêu buổi học:**

- Hiểu cách TanStack Query quản lý server state
- Biết phân biệt client state (Zustand) vs server state (React Query)
- Thực hành Optimistic Updates + Manual Cache Updates
- Master Infinite Scroll với useInfiniteQuery
- Implement Client-side Search với useMemo

---

## 🚀 Mở rộng thêm

### Ideas cho học trò thực hành thêm:

1. **~~Search Posts~~ ✅ ĐÃ THÊM**

   - ✅ SearchBar với TextInput
   - ✅ Real-time filter với useMemo
   - ✅ Empty state khi không tìm thấy
   - 💡 Có thể nâng cấp: Debounce, Highlight results

2. **Filter by User**

   - Dropdown chọn user
   - Fetch posts by userId
   - Multiple query keys

3. **Edit Post**

   - Modal edit
   - useMutation với updatePost
   - Optimistic update

4. **Comments**

   - Fetch comments cho post
   - Add comment với mutation
   - Nested infinite scroll

5. **Offline Mode**
   - Detect network status
   - Pause queries when offline
   - Resume when online

---

## � Troubleshooting

### Lỗi 1: 404 Request failed with status code 404 `/posts/101`

**Nguyên nhân:**

- JSONPlaceholder chỉ có 100 posts (ID: 1-100)
- Khi tạo post mới, API trả về ID > 100 (fake ID)
- Navigate vào detail → GET `/posts/101` → **404 Error**
- `usePost` hook retry nhiều lần khi fetch thất bại

**Giải pháp đã implement:**

```tsx
// 1. Dùng ID âm cho local posts
const optimisticPost: Post = {
  id: -Date.now(), // ID âm = local only
  ...
};

// 2. Chặn navigation vào local posts
onPress={() => {
  if (item.id < 0) {
    Alert.alert('Bài viết local', 'Chỉ xem được danh sách.');
    return;
  }
  navigation.navigate('PostDetail', { postId: item.id });
}}

// 3. Visual indicator
{isLocalPost && (
  <View className="bg-orange-500 px-2 py-1 rounded-full">
    <Text className="text-white text-xs font-semibold">Local</Text>
  </View>
)}

// 4. ✅ Chặn fetch detail với ID âm (QUAN TRỌNG!)
export function usePost(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.getPost(id),
    // Không fetch nếu ID âm hoặc không hợp lệ
    enabled: enabled && id > 0 && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Giảm retry để tránh spam API
  });
}
```

### Lỗi 2: Post mới biến mất sau khi tạo

**Nguyên nhân:**

- `invalidateQueries` refetch từ API
- API không lưu post mới → Refetch không có post

**Giải pháp:**

```tsx
// ❌ KHÔNG dùng
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: postKeys.lists() });
};

// ✅ DÙNG manual cache update
onSuccess: () => {
  // Giữ post trong cache, không refetch
  console.log("Post created - cache updated manually");
};
```

### Lỗi 3: Delete post nhưng xuất hiện lại

**Nguyên nhân:** Tương tự - invalidate refetch lại từ API

**Giải pháp:**

```tsx
// Manual filter post ra khỏi cache
queryClient.setQueriesData({ queryKey: postKeys.lists() }, (old: any) => {
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.filter((post) => post.id !== deletedId),
    })),
  };
});
```

### Lỗi 4: Refetch liên tục (GET /posts 10 lần)

**Nguyên nhân:**

- `refetchOnMount: true` - Refetch mỗi lần mount component
- `refetchOnReconnect: true` - Refetch khi mạng reconnect
- `staleTime` quá ngắn - Data nhanh bị stale

**Giải pháp:**

```typescript
// QueryClient config tối ưu
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // Tăng lên 2 phút
      retry: 2, // Giảm retry
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // ✅ Tắt refetch khi reconnect
      refetchOnMount: false, // ✅ Dùng manual refetch
    },
  },
});

// usePosts hook
export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: postKeys.lists(),
    queryFn: ({ pageParam = 1 }) => postsApi.getPosts(pageParam, 10),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    placeholderData: (previousData) => previousData, // ✅ Giữ data cũ khi fetch
    staleTime: 3 * 60 * 1000, // ✅ 3 phút stale time
    retry: 1, // ✅ Giảm retry
  });
};
```

### Warning: SafeAreaView deprecated

**Fix:** Đã dùng View thay vì SafeAreaView trong code

---

## �📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)

---

## 🎓 Teaching Notes

**Điểm nhấn khi demo cho học sinh:**

1. **Fake API Limitations:**

   - Giải thích tại sao JSONPlaceholder không persist data
   - So sánh với real API behavior
   - Nhấn mạnh local posts pattern là workaround

2. **Manual Cache vs Invalidation:**

   - Show console logs khi create/delete
   - Demo refetch behavior (comment out manual update)
   - Giải thích khi nào dùng cái nào

3. **Optimistic Updates Flow:**

   - Step-by-step trong DevTools
   - Show network tab - request timing
   - Rollback demo (simulate error)

4. **Visual Feedback Importance:**
   - Badge "Local" giúp user hiểu
   - Loading states everywhere
   - Error messages clear

---

**🎉 Happy Coding! Let's build amazing apps together! 🚀**
