"use client";

import { AUTH_COOKIE } from "@/lib/auth";
import { OTPInput } from "input-otp";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const REQUIRED_CODE = process.env.NEXT_PUBLIC_DASHBOARD_PIN || "000000";

const setAuthCookie = () => {
    document.cookie = `${AUTH_COOKIE}=verified; path=/; max-age=${60 * 60 * 12}; SameSite=Lax`;
};

const hasAuthCookie = () => document.cookie.split("; ").some((c) => c.startsWith(`${AUTH_COOKIE}=`));

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "/dashboard/view";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (hasAuthCookie()) {
            router.replace(redirectPath);
        }
    }, [redirectPath, router]);

    useEffect(() => {
        if (otp.length === 6) {
            if (otp === REQUIRED_CODE) {
                setSubmitting(true);
                setAuthCookie();
                router.replace(redirectPath);
            } else {
                setError("Invalid code");
            }
        }
    }, [otp, redirectPath, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (otp.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        if (otp !== REQUIRED_CODE) {
            setError("Invalid code");
            return;
        }

        setSubmitting(true);
        setAuthCookie();
        router.replace(redirectPath);
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-25 px-4">
            <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-[0_25px_35px_rgba(15,23,42,0.08)]">
                <div className="mb-8 text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                        <Image src="/logo.png" alt="Irekeka logo" width={48} height={48} className="object-contain" priority />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">Secure Access</p>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Enter OTP to continue</h1>
                        <p className="mt-2 text-sm text-gray-500">Please enter the 6-digit PIN provided by the admin.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <OTPInput
                        value={otp}
                        onChange={(value) => {
                            setOtp(value);
                            if (error) setError(null);
                        }}
                        maxLength={6}
                        inputMode="numeric"
                        autoFocus
                        render={({ slots }) => (
                            <div className="flex justify-center gap-4">
                                {slots.map(({ char, isActive }, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex h-16 w-14 items-center justify-center rounded-3xl border text-2xl font-semibold transition ${
                                            isActive
                                                ? "border-primary-500 bg-white shadow-[0_0_0_3px_rgba(58,134,255,0.15)]"
                                                : "border-gray-200 bg-gray-50 text-gray-900 shadow-sm"
                                        }`}
                                    >
                                        {char ? "*" : ""}
                                    </div>
                                ))}
                            </div>
                        )}
                    />

                    {error && <p className="text-center text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={otp.length !== 6 || submitting}
                        className="w-full rounded-2xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </main>
    );
}
