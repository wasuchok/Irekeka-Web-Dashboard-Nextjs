import { apiPrivate } from "./httpClient";

export const privateApi = {
    async get<T>(url: string) {
        const res = await apiPrivate.get<T>(url);
        return res.data;
    },

    async post<T>(url: string, data: any) {
        const res = await apiPrivate.post<T>(url, data);
        return res.data;
    },

    async put<T>(url: string, data: any) {
        const res = await apiPrivate.put<T>(url, data);
        return res.data;
    },

    async delete<T>(url: string) {
        const res = await apiPrivate.delete<T>(url);
        return res.data;
    },
};