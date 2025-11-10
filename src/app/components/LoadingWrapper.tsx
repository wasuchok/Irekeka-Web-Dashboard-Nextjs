"use client";
import { useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";

export default function LoadingWrapper() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white transition-colors duration-500">
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-primary-300 border-t-transparent animate-spin">
                    <FiLoader className="text-primary-500" size={28} />
                </div>
                <p className="mt-4 text-primary-500 font-semibold text-base tracking-wide animate-pulse">
                    กำลังโหลดข้อมูล...
                </p>
            </div>
        );
    }

}