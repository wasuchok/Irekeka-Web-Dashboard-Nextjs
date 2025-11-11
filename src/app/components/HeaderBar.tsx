"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const formatClock = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);

const resolveGreeting = (hours: number) => {
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
};

export default function HeaderBar() {
    const [user, setUser] = useState<any>();
    const [mounted, setMounted] = useState(false);
    const [clock, setClock] = useState<string>("");
    const [greeting, setGreeting] = useState<string>("");

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
        const updateClock = () => {
            const now = new Date();
            setClock(formatClock(now));
            setGreeting(resolveGreeting(now.getHours()));
        };
        updateClock();
        const interval = setInterval(updateClock, 60_000);
        setMounted(true);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <header className="h-20 sm:h-24 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400 font-semibold">
                    {clock || "—"}
                </p>
                <p className="text-base font-semibold text-gray-900">
                    {greeting}{" "}
                    <span className="text-gray-500">
                        {user?.Fname ? `${user?.Fname} ${user?.Lname ?? ""}` : ""}
                    </span>
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                    <Image
                        src="/emp.png"
                        alt="User avatar"
                        fill
                        sizes="40px"
                        priority
                        className="object-cover"
                    />
                </div>
            </div>
        </header>
    );
}
