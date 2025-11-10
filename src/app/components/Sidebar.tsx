"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    FiActivity,
    FiCalendar,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiHome,
    FiLogOut,
    FiMenu
} from "react-icons/fi";

const menuItems = [
    { label: "แดชบอร์ด", icon: <FiHome />, href: "/dashboard" },
    {
        label: "รายงานการยืม-คืน",
        icon: <FiActivity />,
        href: "/report",
        navigate: "/report/view",
        hasSubMenu: false,
        subMenu: [],
    },
    { label: "สต็อกสินค้า", icon: <FiCalendar />, href: "/stock/view" },
    { label: "ออกจากระบบ", icon: <FiLogOut />, href: "/logout" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [openMobile, setOpenMobile] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const isMenuActive = (href: string) => {
        if (href === "/report") return pathname === href || pathname.startsWith("/report/");
        if (href === "/stock") return pathname === href || pathname.startsWith("/stock/");
        if (href === "/dashboard") return pathname === href || pathname.startsWith("/dashboard/");
        return pathname === href;
    };

    const toggleSubMenu = (label: string) => {
        setActiveMenu(prev => (prev === label ? null : label));
    };

    return (
        <>

            <button
                className="fixed top-4 left-4 z-40 md:hidden bg-white/90 backdrop-blur-sm shadow-md p-3 rounded-xl hover:bg-white transition-all duration-200"
                onClick={() => setOpenMobile(true)}
                aria-label="Open sidebar"
            >
                <FiMenu size={20} className="text-gray-600" />
            </button>


            <div
                className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ${openMobile ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={() => setOpenMobile(false)}
            />


            <aside
                className={`
                    bg-white/95 backdrop-blur-sm border-r border-gray-100 shadow-sm flex flex-col min-h-screen transition-all duration-300 ease-in-out
                    ${collapsed ? "w-16" : "w-64"}
                    fixed top-0 left-0 z-40 h-full
                    ${openMobile ? "translate-x-0" : "-translate-x-full"}
                    md:static md:translate-x-0 md:flex
                `}
            >

                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">

                        {!collapsed && (
                            <span
                                className="font-bold text-lg text-gray-800 tracking-wide transition-all duration-300"
                            >
                                Irekeka イレーケカ
                            </span>
                        )}
                    </div>


                    <button
                        className="text-gray-500 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200 hidden md:block"
                        onClick={() => setCollapsed(prev => !prev)}
                        aria-label="Toggle Sidebar"
                    >
                        {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                    </button>
                </div>

                {/* 🔹 เมนู */}
                <nav className="flex-1 flex flex-col gap-1 p-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = isMenuActive(item.href);
                        const link = item.navigate || item.href;

                        return (
                            <div key={item.label}>
                                <div className="relative group">
                                    <Link
                                        href={link}
                                        className={`
                                            flex items-center rounded-lg transition-all duration-200 ease-in-out
                                            ${collapsed ? "justify-center w-12 h-12" : "px-3 py-3 gap-3"}
                                            ${isActive
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }
                                        `}
                                        title={collapsed ? item.label : ""}
                                        onClick={() => item.hasSubMenu && !collapsed && toggleSubMenu(item.label)}
                                    >
                                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                                        <span
                                            className={`
                                                font-medium transition-all duration-300
                                                ${collapsed
                                                    ? "absolute left-16 opacity-0 group-hover:opacity-100 group-hover:bg-gray-100 group-hover:text-gray-900 group-hover:px-3 group-hover:py-2 group-hover:rounded-lg group-hover:shadow-md pointer-events-none whitespace-nowrap"
                                                    : "opacity-100"
                                                }
                                                overflow-hidden
                                            `}
                                        >
                                            {item.label}
                                        </span>
                                        {item.hasSubMenu && !collapsed && (
                                            <FiChevronDown
                                                size={16}
                                                className={`ml-auto flex-shrink-0 transition-transform duration-200 ${activeMenu === item.label ? "rotate-180" : ""}`}
                                            />
                                        )}
                                    </Link>
                                </div>

                                {/* 🔹 Sub Menu */}
                                <AnimatePresence>
                                    {item.hasSubMenu && activeMenu === item.label && !collapsed && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-6 mt-2 flex flex-col gap-1 overflow-hidden"
                                        >
                                            {item.subMenu.map((subItem: any) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    className={`
                                                        text-gray-600 hover:bg-gray-50 hover:text-gray-900
                                                        rounded-md px-4 py-2 text-sm transition-colors duration-150
                                                        ${pathname === subItem.href ? "bg-gray-50 text-gray-900 font-medium" : ""}
                                                    `}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* ปุ่มปิด sidebar บนมือถือ */}
            {openMobile && (
                <button
                    className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-full shadow-md p-3 hover:bg-white transition-all duration-200 md:hidden"
                    onClick={() => setOpenMobile(false)}
                    aria-label="Close sidebar"
                >
                    <FiChevronLeft size={20} className="text-gray-600" />
                </button>
            )}
        </>
    );
}
