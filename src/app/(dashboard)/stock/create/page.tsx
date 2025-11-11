"use client";

import { CustomButton } from "@/app/components/Input/CustomButton";
import CustomUploadImage from "@/app/components/Input/CustomUploadImage";
import OptionList from "@/app/components/Input/OptionList";
import TextArea from "@/app/components/Input/TextArea";
import TextField from "@/app/components/Input/TextField";
import { apiPublic } from "@/app/services/httpClient";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ReactSwitch from "react-switch";
import { Controller, useForm } from "react-hook-form";

type CreateStockForm = {
    equipment_name: string;
    type: string;
    status: string;
    en: boolean;
    detail: string;
    img_1: File | null;
    img_2: File | null;
};

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    message?: string;
}

const TYPE_CODE_MAP: Record<string, string> = {
    accessory: "ASR",
    computer: "COM",
    "phone/camera": "PCM",
    equipment: "EQM",
    audio: "ADO",
    other: "OH",
};

const typeOptions = [
    { label: "Computer", value: "Computer" },
    { label: "Equipment", value: "Equipment" },
    { label: "Accessory", value: "Accessory" },
    { label: "Phone/Camera", value: "Phone/Camera" },
    { label: "Audio", value: "Audio" },
    { label: "Other", value: "Other" },
];

const statusOptions = [
    { label: "In stock", value: "in-stock" },
    { label: "Borrowed", value: "borrowed" },
];

export default function CreateStockPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        register,
        watch,
        formState: { errors },
    } = useForm<CreateStockForm>({
        defaultValues: {
            equipment_name: "",
            type: "",
            status: "in-stock",
            en: true,
            detail: "",
            img_1: null,
            img_2: null,
        },
    });

    const selectedType = watch("type");
    const normalizedTypeKey = selectedType?.toLowerCase() || "";
    const resolvedCodeType = selectedType ? TYPE_CODE_MAP[normalizedTypeKey] : undefined;
    const autoDate = useMemo(() => new Date(), []);
    const autoDateDisplay = autoDate.toISOString().slice(0, 10);

    const onSubmit = handleSubmit(async (values) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const formData = new FormData();

            formData.append("equipment_name", values.equipment_name.trim());
            formData.append("type", values.type);

            formData.append("status", values.status || "in-stock");
            formData.append("en", values.en ? "1" : "0");

            if (values.detail) {
                formData.append("detail", values.detail);
            }

            if (values.img_1 instanceof File) {
                formData.append("img_1", values.img_1);
            }

            if (values.img_2 instanceof File) {
                formData.append("img_2", values.img_2);
            }

            const { data: response } = await apiPublic.post<ApiResponse<any>>(
                "/stock",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (!response?.success) {
                throw new Error(response?.error || "Unable to save stock data");
            }

            router.push("/stock/view");
            router.refresh();
        } catch (error: any) {
            console.error("[createStock] error:", error);
            const message =
                error?.response?.data?.error ||
                error?.message ||
                "An unexpected error occurred while saving stock data";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-gray-900">Add Stock Item</h1>
                <p className="text-sm text-gray-500">
                    Provide the equipment details and click save to create a new record.
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Equipment Name"
                        placeholder="Enter equipment name"
                        {...register("equipment_name", {
                            required: "Equipment name is required",
                        })}
                        error={errors.equipment_name?.message}
                        disabled={isSubmitting}
                    />
                    <Controller
                        name="type"
                        control={control}
                        rules={{ required: "Type is required" }}
                        render={({ field, fieldState }) => (
                            <OptionList
                                label="Type"
                                value={field.value || ""}
                                options={typeOptions}
                                onChange={(value) => field.onChange(value)}
                                placeholder="Select type"
                                error={fieldState.error?.message}
                                isLoading={isSubmitting}
                            />
                        )}
                    />
                    <Controller
                        name="status"
                        control={control}
                        render={({ field, fieldState }) => (
                            <OptionList
                                label="Status"
                                value={field.value || "in-stock"}
                                options={statusOptions}
                                onChange={(value) => field.onChange(value)}
                                placeholder="Select status"
                                error={fieldState.error?.message}
                                isLoading={isSubmitting}
                            />
                        )}
                    />
                    <Controller
                        name="en"
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-2">
                                <span className="text-secondary-800 font-medium">
                                    EN
                                </span>
                                <div className="flex items-center gap-3">
                                    <ReactSwitch
                                        onChange={(checked) => field.onChange(checked)}
                                        checked={Boolean(field.value)}
                                        onColor="#34d399"
                                        offColor="#d1d5db"
                                        onHandleColor="#10b981"
                                        offHandleColor="#6b7280"
                                        handleDiameter={22}
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        disabled={isSubmitting}
                                        height={28}
                                        width={56}
                                    />
                                <span className="text-sm font-semibold text-gray-700">
                                    {field.value ? "Enabled" : "Disabled"}
                                </span>
                                </div>
                            </div>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-600">CODE Type (Auto)</p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {resolvedCodeType || "-"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Determined by the selected type
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-600">Code Date / Created At</p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {autoDateDisplay}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Automatically set to today
                        </p>
                    </div>
                </div>

                <Controller
                    name="detail"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextArea
                            label="Detail"
                            rows={4}
                            {...field}
                            error={fieldState.error?.message}
                            placeholder="Add additional notes"
                            isLoading={isSubmitting}
                        />
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                        name="img_1"
                        control={control}
                            render={({ field, fieldState }) => (
                                <div className="flex flex-col gap-2">
                                    <label className="text-secondary-800 font-medium">
                                        Primary Image
                                    </label>
                                <CustomUploadImage
                                    onFileChange={field.onChange}
                                    error={fieldState.error?.message}
                                    isLoading={isSubmitting}
                                />
                            </div>
                        )}
                    />
                    <Controller
                        name="img_2"
                        control={control}
                            render={({ field, fieldState }) => (
                                <div className="flex flex-col gap-2">
                                    <label className="text-secondary-800 font-medium">
                                        Secondary Image
                                    </label>
                                <CustomUploadImage
                                    onFileChange={field.onChange}
                                    error={fieldState.error?.message}
                                    isLoading={isSubmitting}
                                />
                            </div>
                        )}
                    />
                </div>

                {submitError && (
                    <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                        {submitError}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <CustomButton
                        type="button"
                        variant="secondary"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Back
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        variant="primary"
                        className="min-w-[140px]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </CustomButton>
                </div>
            </form>
        </div>
    );
}
