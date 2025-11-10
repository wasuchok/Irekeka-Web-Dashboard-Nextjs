"use client";
import React from "react";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">

            <Sidebar />


            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <HeaderBar />
                <section className="flex-1 p-4 bg-[#f6f8fc]">
                    {children}
                </section>
            </div>
        </div>
    );
}