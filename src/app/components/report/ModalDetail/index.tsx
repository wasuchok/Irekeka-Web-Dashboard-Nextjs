import { IMAGE_URL } from "@/app/config/variable";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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

const ModalDetail = ({ isOpen, onClose, data }: any) => {

    const options = [
        { label: "Computer", value: "Computer" },
        { label: "Equipment", value: "Equipment" },
        { label: "Accessory", value: "Accessory" },
        { label: "Phone/Camera", value: "Phone/Camera" },
        { label: "Other", value: "Other" },
    ];

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            equipment_code: "",
            equipment_name: "",
            type: "",
            status: "",
            detail: "",
            image_primary: null,
            image_secondary: null
        },
    });

    useEffect(() => {
        console.log(data)
        if (data) {
            reset({
                equipment_code: data?.equipment_code || "",
                equipment_name: data?.equipment_name || "",
                type: data?.type || "",
                status: data?.status || "",
                detail: data?.detail || "",
                image_primary: null,
                image_secondary: null
            });
        }
    }, [data, reset])

    const primaryImageUrl = normalizeImageSource(
        data?.img_1 ?? data?.image_one ?? data?.image1 ?? data?.images?.[0]
    );
    const secondaryImageUrl = normalizeImageSource(
        data?.img_2 ?? data?.image_two ?? data?.image2 ?? data?.images?.[1]
    );

    return (
        <>
            <MinimalModal isOpen={isOpen} onClose={onClose} title="Detailed information" width="max-w-2xl">
                <div className="flex flex-col gap-4">
                    <div>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field, fieldState }) => (
                                <OptionList options={options} label="Type" {...field} placeholder="Please fill in information..." />
                            )}
                        />

                    </div>
                    <div>
                        <Controller
                            name="equipment_code"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField readOnly label="Code"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..." />
                            )}
                        />
                    </div>
                    <div>
                        <Controller
                            name="equipment_name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField label="Name"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..." />
                            )}
                        />
                    </div>
                    <div>
                        <Controller
                            name="detail"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextArea readOnly label="Detail"
                                    {...field}
                                    error={fieldState.error?.message}
                                    placeholder="Please fill in information..." />

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
                                        defaultImageUrl={`${IMAGE_URL}${primaryImageUrl}`}
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
                                        defaultImageUrl={`${IMAGE_URL}${secondaryImageUrl}`}
                                    />
                                </div>
                            )}
                        />
                    </div>
                </div>

            </MinimalModal>
        </>
    )
}

export default ModalDetail

