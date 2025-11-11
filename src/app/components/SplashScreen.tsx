"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "irekeka:splash";

interface SplashScreenProps {
    children: React.ReactNode;
}

export default function SplashScreen({ children }: SplashScreenProps) {
    const [showSplash, setShowSplash] = useState(true);
    const [renderSplash, setRenderSplash] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (sessionStorage.getItem(STORAGE_KEY)) {
            setShowSplash(false);
            setRenderSplash(false);
            return;
        }

        const timer = setTimeout(() => {
            setShowSplash(false);
            sessionStorage.setItem(STORAGE_KEY, "1");
        }, 400);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (showSplash) return;
        const timer = setTimeout(() => setRenderSplash(false), 2500);
        return () => clearTimeout(timer);
    }, [showSplash]);

    const handleSkip = () => {
        setShowSplash(false);
        sessionStorage.setItem(STORAGE_KEY, "1");
    };

    return (
        <>
            {children}
            {renderSplash && (
                <div
                    className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-gray-900 transition-opacity duration-500 ${showSplash ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50 animate-splash-fade" />
                    <div className="relative flex flex-col items-center space-y-6 px-6 text-center animate-splash-fade">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-primary-100 bg-white shadow-md animate-splash-scale">
                            <Image
                                src="/logo.png"
                                alt="Irekeka logo"
                                width={80}
                                height={80}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.6em] text-primary-400">Irekeka イレーケカ</p>
                            <h2 className="mt-3 text-2xl font-semibold text-primary-900">Borrow & Return Hub</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                One place to monitor stocks, borrowings, and maintenance status.
                            </p>
                        </div>
                        <div className="flex w-48 flex-col gap-3 pt-4">
                            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-400">
                                <span className="animate-splash-slide">Loading</span>
                                <span className="text-primary-600">···</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
                                <div className="h-full w-1/3 rounded-full bg-primary-500 animate-splash-bar" />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="text-xs font-semibold uppercase tracking-wide text-primary-300 transition hover:text-primary-700"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
