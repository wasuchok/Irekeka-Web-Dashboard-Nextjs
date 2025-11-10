"use client";

import Select from "react-select";

interface OptionListProps {
    label?: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (val: string) => void;
    placeholder?: string;
    required?: boolean;
    isLoading?: boolean;
    isEditLoading?: boolean;
    error?: string;
}

export default function OptionList({
    label,
    value,
    options,
    onChange,
    placeholder = "เลือก...",
    required = false,
    isLoading = false,
    isEditLoading = false,
    error,
}: OptionListProps) {
    const selectedOption = options.find((opt) => opt.value === value) || null;
    const isActuallyLoading = isLoading || isEditLoading;

    return (
        <div className="flex flex-col gap-1 relative">
            {label && (
                <label className="text-secondary-800 font-medium mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <Select
                    options={options}
                    value={selectedOption}
                    onChange={(selected) => onChange(selected ? selected.value : "")}
                    placeholder={placeholder}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: "0.5rem",
                            borderColor: error ? "#d1d5db" : "#d1d5db",
                            padding: "0.1rem 0.2rem",
                            minHeight: "2.25rem",
                            boxShadow: "none",
                            "&:hover": { borderColor: error ? "#d1d5db" : "#3eb5a3" },
                        }),
                    }}
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#3eb5a3",
                            primary25: "#d1fae5",
                            primary50: "#a7f3d0",
                            neutral0: "white",
                            neutral20: error ? "#d1d5db" : "#d1d5db",
                            neutral30: error ? "#d1d5db" : "#3eb5a3",
                        },
                    })}
                    isDisabled={isLoading}
                />

                {isActuallyLoading && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
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

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}