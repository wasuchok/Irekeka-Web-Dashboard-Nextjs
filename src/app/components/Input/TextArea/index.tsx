import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    fieldSize?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        { label, error, fieldSize = "md", className, isLoading = false, ...props },
        ref
    ) => {
        const sizeClass =
            fieldSize === "sm"
                ? "text-sm px-3 py-1"
                : fieldSize === "lg"
                    ? "text-lg px-5 py-3"
                    : "text-base px-4 py-2";

        return (
            <div className="flex flex-col gap-1 w-full relative">
                {label && (
                    <label className="text-secondary-800 font-medium mb-1">
                        {label}
                    </label>
                )}
                <div className="relative w-full">
                    <textarea
                        ref={ref}
                        className={twMerge(
                            "rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition w-full resize-none",
                            sizeClass,
                            className,
                            isLoading ? "pr-10" : ""
                        )}
                        {...props}
                        disabled={props.disabled || isLoading}
                    />
                    {isLoading && (
                        <div className="absolute inset-y-0 right-2 flex items-center">
                            <svg
                                className="animate-spin h-4 w-4 text-primary-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                ></path>
                            </svg>
                        </div>
                    )}
                </div>
                {error && (
                    <span className="text-red-500 text-xs mt-1">{error}</span>
                )}
            </div>
        );
    }
);

TextArea.displayName = "TextArea";
export default TextArea;