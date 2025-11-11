"use client";

import { IMAGE_URL } from "@/app/config/variable";
import { apiPublic } from "@/app/services/httpClient";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CustomButton } from "../../Input/CustomButton";
import CustomUploadImage from "../../Input/CustomUploadImage";
import OptionList from "../../Input/OptionList";
import TextArea from "../../Input/TextArea";
import TextField from "../../Input/TextField";
import MinimalModal from "../../Modal";

const normalizeImageSource = (value: any) => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return value.url || value.preview || value.path || value.src;
    }

    return undefined;
};

const appendBaseImageUrl = (relativePath?: string) => {
    if (!relativePath) return undefined;
    const sanitizedPath = relativePath.trim();
    if (!sanitizedPath) return undefined;
    if (/^https?:\/\//i.test(sanitizedPath)) return sanitizedPath;

    const trimmedBase = IMAGE_URL.replace(/\/+$/, "");
    const trimmedPath = sanitizedPath.replace(/^\/+/, "");
    return `${trimmedBase}/${trimmedPath}`;
};

type StockFormValues = {
    equipment_code: string;
    equipment_name: string;
    type: string;
    status: string;
    detail: string;
    image_primary: File | null;
    image_secondary: File | null;
};

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    message?: string;
    duration?: number;
    timestamp?: string;
}

interface ModalDetailProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onUpdated?: (stock: any) => void;
}

const ModalDetail = ({ isOpen, onClose, data, onUpdated }: ModalDetailProps) => {

    const options = [
        { label: "Computer", value: "Computer" },
        { label: "Equipment", value: "Equipment" },
        { label: "Accessory", value: "Accessory" },
        { label: "Phone/Camera", value: "Phone/Camera" },
        { label: "Audio", value: "Audio" },
        { label: "Other", value: "Other" },
    ];

    const statusOptions = useMemo(
        () => [
            { label: "In stock", value: "in-stock" },
            { label: "Borrowed", value: "borrowed" },
        ],
        []
    );

    const { control, handleSubmit, reset } = useForm<StockFormValues>({
        defaultValues: {
            equipment_code: "",
            equipment_name: "",
            type: "",
            status: "",
            detail: "",
            image_primary: null,
            image_secondary: null,
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            reset({
                equipment_code: data?.equipment_code || "",
                equipment_name: data?.equipment_name || "",
                type: data?.type || "",
                status: data?.status || "",
                detail: data?.detail || "",
                image_primary: null,
                image_secondary: null,
            });
            setSubmitError(null);
        }
    }, [data, reset]);

    useEffect(() => {
        if (!isOpen) {
            setSubmitError(null);
        }
    }, [isOpen]);

    const primaryImagePath = normalizeImageSource(
        data?.img_1 ?? data?.image_one ?? data?.image1 ?? data?.images?.[0]
    );
    const secondaryImagePath = normalizeImageSource(
        data?.img_2 ?? data?.image_two ?? data?.image2 ?? data?.images?.[1]
    );
    const primaryImageUrl = appendBaseImageUrl(primaryImagePath);
    const secondaryImageUrl = appendBaseImageUrl(secondaryImagePath);

    const onSubmit = handleSubmit(async (values) => {
        if (!data?.equipment_code) {
            setSubmitError("ไม่พบรหัสอ้างอิงของอุปกรณ์");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const formData = new FormData();

            const textFields: Array<[string, string | undefined]> = [
                ["equipment_name", values.equipment_name],
                ["type", values.type],
                ["status", values.status],
                ["detail", values.detail],
            ];

            textFields.forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (values.image_primary instanceof File) {
                formData.append("img_1", values.image_primary);
            }

            if (values.image_secondary instanceof File) {
                formData.append("img_2", values.image_secondary);
            }

            const { data: response } = await apiPublic.put<ApiResponse<any>>(
                `/stock/${encodeURIComponent(data.equipment_code)}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (!response?.success) {
                throw new Error(response?.error || "แก้ไขข้อมูลไม่สำเร็จ");
            }

            onUpdated?.(response.data);
        } catch (error: any) {
            const message =
                error?.response?.data?.error ||
                error?.message ||
                "เกิดข้อผิดพลาดในการแก้ไขข้อมูล";
            setSubmitError(message);
            console.error("[ModalDetail] update error:", error);
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <>
            <MinimalModal isOpen={isOpen} onClose={onClose} title="Detailed information" width="max-w-2xl">
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="type"
                            control={control}
                            rules={{ required: "กรุณาเลือกประเภท" }}
                            render={({ field, fieldState }) => (
                                <OptionList
                                    options={options}
                                    label="Type"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..."
                                />
                            )}
                        />
                        <Controller
                            name="status"
                            control={control}
                            rules={{ required: "กรุณาเลือกสถานะ" }}
                            render={({ field, fieldState }) => (
                                <OptionList
                                    options={statusOptions}
                                    label="Status"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..."
                                />
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="equipment_code"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    readOnly
                                    label="Code"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..."
                                />
                            )}
                        />
                        <Controller
                            name="equipment_name"
                            control={control}
                            rules={{ required: "กรุณากรอกชื่ออุปกรณ์" }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label="Name"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..."
                                />
                            )}
                        />
                    </div>
                    <div>
                        <Controller
                            name="detail"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextArea
                                    rows={4}
                                    label="Detail"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..."
                                />
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="image_primary"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="flex flex-col gap-2">
                                    <label className="text-secondary-800 font-medium">Image 1</label>
                                    <CustomUploadImage
                                        onFileChange={field.onChange}
                                        error={fieldState.error?.message}
                                        defaultImageUrl={primaryImageUrl}
                                        isLoading={isSubmitting}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="image_secondary"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="flex flex-col gap-2">
                                    <label className="text-secondary-800 font-medium">Image 2</label>
                                    <CustomUploadImage
                                        onFileChange={field.onChange}
                                        error={fieldState.error?.message}
                                        defaultImageUrl={secondaryImageUrl}
                                        isLoading={isSubmitting}
                                    />
                                </div>
                            )}
                        />
                    </div>
                    {submitError && (
                        <div className="rounded-lg px-4 py-2 text-sm bg-red-50 text-red-600">
                            {submitError}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <CustomButton type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            ยกเลิก
                        </CustomButton>
                        <CustomButton type="submit" variant="primary" className="min-w-[130px]" disabled={isSubmitting}>
                            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                        </CustomButton>
                    </div>
                </form>

            </MinimalModal>
        </>
    )
}

export default ModalDetail
