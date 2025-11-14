"use client";

import { CustomButton } from "@/app/components/Input/CustomButton";


import OptionList from "@/app/components/Input/OptionList";
import TextField from "@/app/components/Input/TextField";

import { useState } from "react";
import { FaCalendarPlus, FaSearch, FaSyncAlt } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";

interface SearchField {
    accessor: string;
    header: string;
    type: "text" | "dropdown" | "between" | "date" | "date-range";
    enumValues?: Array<string | { label: string; value: string }>;
    fields?: any;
}


export default function SearchDynamicHeader({

    onUpload,
    onCreate,
    onExport,
    onSearch,
    onReset,
    fields
}: any) {

    const [formData, setFormData] = useState<Record<string, any>>({});


    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(formData);
    };

    const handleReset = () => {
        setFormData({});
        onReset();
    };

    return (
        <div className="mx-auto bg-white shadow-md px-4 py-5 sm:px-7 sm:py-6 flex flex-col gap-4 w-full rounded-lg">
            <div className="flex items-center justify-between mb-1">
                <div className="text-base font-semibold text-gray-800">
                    ค้นหา
                </div>

                {onExport && (
                    <CustomButton
                        variant="primary"
                        onClick={onExport}
                        icon={<FaFileExport size={15} />}
                    >
                        ส่งออก
                    </CustomButton>
                )}

                {onCreate && (
                    <CustomButton
                        variant="primary"
                        onClick={onCreate}
                        icon={<FaCalendarPlus size={15} />}
                        className="px-4 py-2 text-base font-semibold rounded-lg shadow-sm bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        เพิ่ม
                    </CustomButton>
                )}

                {onUpload && (
                    <CustomButton
                        variant="primary"
                        onClick={onUpload}
                        icon={<FiUpload size={15} />}
                        className="px-4 py-2 text-base font-semibold rounded-lg shadow-sm bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        อัปโหลด
                    </CustomButton>
                )}
            </div>
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4"
            >
                {fields.map((field: any) => {
                    const { accessor, header, type, enumValues } = field;

                    switch (type) {
                        case "text":
                            return (
                                <TextField
                                    key={accessor}
                                    label={header}
                                    placeholder="กรอกคำค้นหา..."
                                    value={formData[accessor] || ""}
                                    onChange={(e) =>
                                        handleChange(accessor, e.target.value)
                                    }
                                />
                            );
                        case "dropdown":
                            return (
                                <OptionList
                                    key={accessor}
                                    label={header}
                                    value={formData[accessor] || ""}
                                    options={(enumValues || []).map((v: any) =>
                                        typeof v === "string"
                                            ? { label: v, value: v }
                                            : v
                                    )}
                                    onChange={(val) =>
                                        handleChange(accessor, val)
                                    }
                                />
                            );

                        case "between":
                            return (
                                <div
                                    key={accessor}
                                    className="grid grid-cols-2 gap-2"
                                >
                                    <TextField
                                        label={`${header}`}
                                        placeholder="ตั้งแต่"
                                        type="number"
                                        value={
                                            formData[`${accessor}_from`] || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                `${accessor}_from`,
                                                e.target.value
                                            )
                                        }
                                    />
                                    <TextField
                                        label={`(ถึง)`}
                                        placeholder="ถึง"
                                        type="number"
                                        value={
                                            formData[`${accessor}_to`] || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                `${accessor}_to`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            );
                        case "date":
                            return (
                                <TextField
                                    key={accessor}
                                    label={header}
                                    placeholder="เลือกวันที่"
                                    type="date"
                                    value={formData[accessor] || ""}
                                    onChange={(e) =>
                                        handleChange(accessor, e.target.value)
                                    }
                                />
                            );
                        case "date-range":
                            return (
                                <div
                                    key={accessor}
                                    className="grid grid-cols-2 gap-2"
                                >
                                    <TextField
                                        label={`${header} (จาก)`}
                                        placeholder="เลือกวันที่"
                                        type="date"
                                        value={
                                            formData[`${accessor}_from`] || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                `${accessor}_from`,
                                                e.target.value
                                            )
                                        }
                                    />
                                    <TextField
                                        label={`${header} (ถึง)`}
                                        placeholder="เลือกวันที่"
                                        type="date"
                                        value={
                                            formData[`${accessor}_to`] || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                `${accessor}_to`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            );

                        default:
                            return null;
                    }
                })}

                {fields.length > 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end mt-2 gap-2">
                        <CustomButton
                            variant="secondary"
                            onClick={handleReset}
                            icon={<FaSyncAlt size={15} />}
                            className="w-full sm:w-auto px-4 py-2 text-base rounded-lg shadow-sm bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-200"
                        >
                            ล้าง
                        </CustomButton>
                        <CustomButton
                            variant="primary"
                            icon={<FaSearch size={15} />}
                            className="w-full sm:w-auto px-4 py-2 text-base font-semibold rounded-lg shadow-sm bg-primary-600 hover:bg-primary-700 text-white"
                        >
                            ค้นหา
                        </CustomButton>
                    </div>
                )}
            </form>
        </div>
    );
}
