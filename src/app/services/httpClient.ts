
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * ฟังก์ชันสร้าง instance ของ Axios
 * ใช้ได้ทั้ง Public และ Private
 */
const createHttpClient = (withAuth: boolean = false): AxiosInstance => {
    const instance = axios.create({
        baseURL: "http://localhost:3000/api/v1",
        headers: {
            "Content-Type": "application/json",
        },
    });

    // ถ้ามี Auth → ใส่ Token ใน Header
    if (withAuth) {
        instance.interceptors.request.use((config) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    // ✅ Interceptor ตอบกลับ (เช่น เช็ค Error)
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error) => {
            console.error("HTTP Error:", error.response?.data || error.message);
            throw error;
        }
    );

    return instance;
};

// ✅ สร้าง instance แยกเป็น Public / Private
export const apiPublic = createHttpClient(false);
export const apiPrivate = createHttpClient(true);

/**
 * 🔁 ฟังก์ชัน Reuse สำหรับ GET / POST / PUT / DELETE
 */
export const httpClient = {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const res = await apiPublic.get<T>(url, config);
        return res.data;
    },

    post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const res = await apiPublic.post<T>(url, data, config);
        return res.data;
    },

    put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const res = await apiPublic.put<T>(url, data, config);
        return res.data;
    },

    delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const res = await apiPublic.delete<T>(url, config);
        return res.data;
    },
};