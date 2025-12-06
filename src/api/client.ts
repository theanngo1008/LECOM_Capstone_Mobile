import axios from "axios";
import { useAuthStore } from "../store/auth-store";

export const apiClient = axios.create({
  baseURL: "https://lecom.click/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ========================
// REQUEST INTERCEPTOR
// ========================
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    console.log("📤 Client: Request interceptor", {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ Client: No token found in request");
    }

    return config;
  },
  (error) => {
    console.error("❌ Client: Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ========================
// RESPONSE INTERCEPTOR
// ========================
// ...existing code...

apiClient.interceptors.response.use(
  (response) => {
    console.log("📥 Client: Response success", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    console.log("🚨 Client: Response Error", {
      url: originalRequest?.url,
      status,
      message: error.message,
      hasRefreshToken: !!useAuthStore.getState().refreshToken,
      isRetry: originalRequest?._retry,
    });

    if (!originalRequest) {
      console.error("❌ Client: No original request config");
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      const { refreshToken, userId, setAuth, logout } = useAuthStore.getState();

      console.log("🔄 Client: 401 detected", {
        hasRefreshToken: !!refreshToken,
        userId,
        isRefreshing,
        queueLength: failedQueue.length,
      });

      if (!refreshToken) {
        console.warn("⚠️ Client: No refresh token - logging out");
        logout();
        return Promise.reject(error);
      }

      // ✅ Queue requests khi đang refresh
      if (isRefreshing) {
        console.log("⏳ Client: Already refreshing, queueing request", {
          url: originalRequest.url,
          queuePosition: failedQueue.length + 1,
        });
        
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("✅ Client: Queued request resolved with new token");
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            console.error("❌ Client: Queued request failed:", err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("📤 Client: Calling refresh token API...");
        const { data } = await axios.post(
          "https://lecom.click/api/auth/refresh",
          { refreshToken, userId }
        );

        console.log("📥 Client: Refresh token response:", {
          hasToken: !!data?.result?.token,
          hasRefreshToken: !!data?.result?.refreshToken,
        });

        const newToken = data?.result?.token;
        const newRefresh = data?.result?.refreshToken;

        if (newToken && newRefresh) {
          console.log("✅ Client: Token refreshed successfully");
          setAuth(newToken, newRefresh, userId!);
          
          // ✅ Process queued requests
          console.log(`🔄 Client: Processing ${failedQueue.length} queued requests`);
          processQueue(null, newToken);

          // ✅ Retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log("🔄 Client: Retrying original request");
          return apiClient(originalRequest);
        } else {
          console.error("❌ Client: Invalid refresh response - logging out");
          processQueue(error, null);
          logout();
          return Promise.reject(error);
        }
      } catch (err: any) {
        console.error("❌ Client: Refresh token failed:", {
          status: err.response?.status,
          message: err.message,
        });
        processQueue(err, null);
        logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
        console.log("✅ Client: Refresh process completed");
      }
    }

    // Log other errors
    console.error("❌ Client: Error", {
      status,
      url: originalRequest?.url,
      message: error.message,
    });
    return Promise.reject(error);
  }
);