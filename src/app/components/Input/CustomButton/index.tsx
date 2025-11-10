import React from "react";
import { twMerge } from "tailwind-merge";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const CustomButton = ({
    variant = "primary",
    icon,
    children,
    className = "",
    ...rest
}: CustomButtonProps) => {
    let base =
        "inline-flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all focus:outline-none shadow";

    let variantClass = "";
    switch (variant) {
        case "primary":
            variantClass = "bg-primary-600 text-white hover:bg-primary-700";
            break;
        case "secondary":
            variantClass =
                "bg-secondary-100 text-secondary-800 hover:bg-secondary-200 border border-secondary-300";
            break;
        case "danger":
            variantClass = "bg-red-600 text-white hover:bg-red-700";
            break;
    }

    return (
        <button className={twMerge(base, variantClass, className)} {...rest}>
            {icon}
            {children}
        </button>
    );
};