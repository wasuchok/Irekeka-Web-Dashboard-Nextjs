import { apiPublic } from "./httpClient";

export const publicApi = {

    async get<T>(url: string) {
        const res = await apiPublic.get<T>(url);
        return res.data;
    },

    // ✅ POST - ส่งข้อมูล (ตัวอย่าง /auth/login)
    async post<T>(url: string, data: any) {
        const res = await apiPublic.post<T>(url, data);
        return res.data;
    },

    // ✅ PUT - แก้ไขข้อมูล (ตัวอย่าง /profile/update)
    async put<T>(url: string, data: any) {
        const res = await apiPublic.put<T>(url, data);
        return res.data;
    },

    // ✅ DELETE - ลบข้อมูล (ตัวอย่าง /public/remove)
    async delete<T>(url: string) {
        const res = await apiPublic.delete<T>(url);
        return res.data;
    },
};