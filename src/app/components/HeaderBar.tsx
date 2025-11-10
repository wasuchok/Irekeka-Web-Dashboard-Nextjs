"use client";

import { useEffect, useState } from "react";
import { IMAGE_URL } from "../config/variable";

export default function HeaderBar() {
    const [user, setUser] = useState<any>();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse user from localStorage", err);
                setUser(null);
            }
        }
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-end px-4 sm:px-6">
            <div className="flex items-center gap-3">

                <div className="relative flex items-center justify-center">
                    <img
                        src={`${IMAGE_URL}/emp_pic/660042.jpg`}
                        alt="avatar"
                        className="rounded-full w-8 h-8 sm:w-9 sm:h-9 border border-gray-200"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </div>


                <div className="flex flex-col items-start leading-tight min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate max-w-[120px] sm:max-w-[180px]">
                        {user?.Fname} {user?.Lname}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                        ทีม {user?.Sect}
                    </div>
                </div>
            </div>
        </header>
    );
}