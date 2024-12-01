import type { UserProfile } from "@/stores/auth";
import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosInstance } from "axios";
import { getAuth } from "firebase/auth";

interface Api extends AxiosInstance {
    getUserProfile: (url: string) => Promise<UserProfile>;
}

interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    error?: string;
    user?: T;
    posts?: T;
    settings?: T;
}

// Create axios instance
const api: Api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000
}) as Api;

// Request interceptor
api.interceptors.request.use(
    async (config: RetryConfig) => {
        if (!config._retry) {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                try {
                    // Try to get token from localStorage first
                    let token = localStorage.getItem("jwt");

                    // If no token in localStorage or this is a retry, get a new one
                    if (!token || config._retry) {
                        token = await user.getIdToken(config._retry || false);
                        localStorage.setItem("jwt", token);
                    }

                    config.headers.Authorization = `Bearer ${token}`;
                } catch (error) {
                    console.error("Error getting token:", error);
                    // If there's an error getting the token, remove it from localStorage
                    localStorage.removeItem("jwt");
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalConfig = error.config as RetryConfig;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;

            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (user) {
                    // Force token refresh
                    const newToken = await user.getIdToken(true);
                    localStorage.setItem("jwt", newToken);
                    originalConfig.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalConfig);
                }
            } catch (refreshError) {
                // If refresh fails, clear the token
                localStorage.removeItem("jwt");
                throw refreshError;
            }
        }

        return Promise.reject(error);
    }
);

api.getUserProfile = async (uid: string): Promise<UserProfile> => {
    const { data } = await api.get<ApiResponse<UserProfile>>(`/users/${uid}`);

    if (!data.success || !data.user) {
        throw new Error("Failed to fetch user profile");
    }

    if (!data.user.role || !["monastic", "patron"].includes(data.user.role)) {
        throw new Error("Invalid user role");
    }

    return data.user;
};

// TODO add getMonasticProfile and getPatronProfile

export default api;
