import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaRegFileExcel } from "react-icons/fa";
import { FiTrash2, FiUpload } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";

interface CustomUploadExcelFileWithPreviewProps {
    onFileChange: (file: File | null, data?: any[]) => void;
    className?: string;
    variant?: "primary" | "secondary" | "danger";
    error?: string;
    defaultFileName?: string;
    isLoading?: boolean;
}

const CustomUploadExcelFileWithPreview: React.FC<CustomUploadExcelFileWithPreviewProps> = ({
    onFileChange,
    className = "",
    variant = "primary",
    error,
    defaultFileName,
    isLoading = false,
}) => {
    const [fileName, setFileName] = useState<string | null>(null);

    useEffect(() => {
        if (defaultFileName) setFileName(defaultFileName);
    }, [defaultFileName]);

    const readExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (!data) return;

            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            onFileChange(file, jsonData);
        };
        reader.readAsBinaryString(file);
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles && acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setFileName(file.name);
                readExcel(file);
            }
        },
        [onFileChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
            "application/vnd.ms-excel": [],
        },
        multiple: false,
    });

    const colorClass = {
        primary: "border-primary-600 hover:bg-primary-50",
        secondary: "border-secondary-600 hover:bg-secondary-50",
        danger: "border-red-600 hover:bg-red-50",
    }[variant];

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFileName(null);
        onFileChange(null, []);
    };

    return (
        <div className="flex flex-col gap-1">
            <div
                {...getRootProps()}
                className={twMerge(
                    "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors",
                    isDragActive ? colorClass : "border-gray-300 hover:bg-gray-50",
                    error ? "border-red-500" : "",
                    className
                )}
            >
                <input {...getInputProps()} />

                {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-primary-600">
                        <svg
                            className="animate-spin h-8 w-8 text-primary-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-sm font-medium">กำลังโหลด...</p>
                    </div>
                ) : fileName ? (
                    <div className="relative flex items-center gap-3 bg-green-50 border border-green-300 rounded-md px-3 py-2 w-full max-w-xs">
                        <FaRegFileExcel className="text-green-600 w-6 h-6 flex-shrink-0" />
                        <span className="truncate font-medium text-gray-800">{fileName}</span>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="ml-auto rounded-full bg-red-600 p-1 text-white hover:bg-red-700 transition-opacity"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <div className="bg-gray-100 p-3 rounded-full">
                            <FiUpload size={24} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">ลากไฟล์ Excel มาวางที่นี่</p>
                        <span className="text-xs text-gray-400">หรือ</span>
                        <button
                            type="button"
                            className={twMerge(
                                "mt-1 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                variant === "primary"
                                    ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
                                    : variant === "secondary"
                                        ? "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                            )}
                        >
                            เลือกไฟล์ Excel
                        </button>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
        </div>
    );
};

export default CustomUploadExcelFileWithPreview;
