"use client";

import ModalDetail from "@/app/components/report/ModalDetail";
import { ScrollableTable } from "@/app/components/report/table";
import { IMAGE_URL } from "@/app/config/variable";
import { apiPublic } from "@/app/services/httpClient";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactSwitch from "react-switch";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

const SearchDynamicHeader = dynamic(
    () => import("@/app/components/report/SearchHeader"),
    { ssr: false }
);

export default function Page() {
    const router = useRouter();
    const [openModalDetail, setOpenModalDetail] = useState(false)
    const [stocks, setStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<any>(null);
    const [enUpdating, setEnUpdating] = useState<Record<string, boolean>>({});
    const [rowDeleting, setRowDeleting] = useState<Record<string, boolean>>({});
    const [pagination, setPagination] = useState({
        totalPages: 1,
        currentPage: 1,
    });


    const fields = [
        { accessor: "equipment_code", header: "Code", type: "text" },
        { accessor: "equipment_name", header: "Name", type: "text" },
        {
            accessor: "type",
            header: "Type",
            type: "dropdown",
            enumValues: ["Computer", "Equipment", "Accessory", "Phone/Camera", "Audio", "Other"],
        },
        {
            accessor: "status",
            header: "Status",
            type: "dropdown",
            enumValues: ["in-stock", "borrowed"],
        },
    ];


    const fetchStocks = async (params: Record<string, any> = {}) => {
        try {
            setLoading(true);

            const { data, status } = await apiPublic.get("/stock/pagi", {
                params: {
                    page: params.page || 1,
                    limit: 10,
                    ...params,
                },
            });

            if (status === 200 && data.success) {
                setStocks(data.data || []);
                setPagination({
                    totalPages: data.pagination.totalPages,
                    currentPage: data.pagination.currentPage,
                });
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleSearch = (values: Record<string, any>) => {
        console.log("🔍 ค้นหา:", values);
        fetchStocks(values);
    };


    const handleReset = () => {
        console.log("♻️ รีเซ็ตฟอร์มแล้ว");
        fetchStocks();
    };

    const handleCreate = () => router.push("/stock/create");

    const handleModalClose = () => {
        setOpenModalDetail(false);
        setDetail(null);
    };

    const handleStockUpdated = (updated: any) => {
        const previousCode = detail?.equipment_code;

        if (!updated || !previousCode) {
            setOpenModalDetail(false);
            return;
        }

        setStocks((prev) => {
            let hasMatch = false;

            const next = prev.map((stock) => {
                if (stock.equipment_code === previousCode) {
                    hasMatch = true;
                    return { ...stock, ...updated };
                }

                return stock;
            });

            return hasMatch ? next : prev;
        });
        setDetail(updated);
        setOpenModalDetail(false);
    };


    useEffect(() => {
        fetchStocks();
    }, []);

    const handleToggleEn = async (stock: any) => {
        const code = stock?.equipment_code;
        if (!code) return;

        const nextValue = stock.en ? 0 : 1;
        setEnUpdating((prev) => ({ ...prev, [code]: true }));

        try {
            const { data: response } = await apiPublic.patch<ApiResponse<any>>(
                `/stock/${encodeURIComponent(code)}/status`,
                { en: nextValue }
            );

            if (response?.success) {
                const updated = response.data;
                setStocks((prev) =>
                    prev.map((item) =>
                        item.equipment_code === code
                            ? { ...item, en: updated?.en ?? nextValue, status: updated?.status ?? item.status }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error("Toggle EN failed:", error);
        } finally {
            setEnUpdating((prev) => {
                const { [code]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleDeleteStock = async (stock: any) => {
        const code = stock?.equipment_code;
        if (!code) return;
        if (rowDeleting[code]) return;

        const confirmed = typeof window !== "undefined" ? window.confirm("ยืนยันการลบข้อมูลนี้หรือไม่?") : true;
        if (!confirmed) return;

        setRowDeleting((prev) => ({ ...prev, [code]: true }));

        try {
            const { data: response } = await apiPublic.delete<ApiResponse<null>>(
                `/stock/${encodeURIComponent(code)}`
            );

            if (response?.success) {
                setStocks((prev) => prev.filter((item) => item.equipment_code !== code));
                if (detail?.equipment_code === code) {
                    setDetail(null);
                    setOpenModalDetail(false);
                }
            }
        } catch (error) {
            console.error("Delete stock failed:", error);
        } finally {
            setRowDeleting((prev) => {
                const { [code]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const columns: any[] = [
        {
            header: "No.",
            accessor: "seq",
            width: "60px",
        },
        {
            header: "Image",
            accessor: "img_1",
            width: "140px",
            render: (value: string, data: any) => {
                const images = [value, data.img_2].filter(Boolean);
                if (images.length === 0) {
                    return (
                        <div className="w-20 h-16 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-gray-400 text-xs">No image</span>
                        </div>
                    );
                }

                return (
                    <div className="flex gap-2">
                        {images.map((img: string, index: number) => (
                            <img
                                key={index}
                                src={`${IMAGE_URL}${img}`}
                                alt={`Equipment ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                        ))}
                    </div>
                );
            },
        },

        {
            header: "Code",
            accessor: "equipment_code",
            width: "150px",
        },
        {
            header: "Name",
            accessor: "equipment_name",
            width: "250px",
        },
        {
            header: "Type",
            accessor: "type",
            width: "160px",
        },
        {
            header: "Status",
            accessor: "status",
            width: "120px",
            render: (value: string) => {
                const isInStock = value === "in-stock";
                return (
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${isInStock
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            header: "Enable",
            accessor: "en",
            width: "140px",
            render: (_: string, row: any) => {
                const code = row?.equipment_code;
                const loading = Boolean(code && enUpdating[code]);

                return (
                    <div className="flex items-center gap-2">
                        <ReactSwitch
                            onChange={() => handleToggleEn(row)}
                            checked={Boolean(row.en)}
                            disabled={loading}
                            onColor="#34d399"
                            offColor="#d1d5db"
                            onHandleColor="#10b981"
                            offHandleColor="#6b7280"
                            handleDiameter={18}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={24}
                            width={46}
                        />
                        <span className="text-xs font-semibold text-gray-600">
                            {row.en ? "ON" : "OFF"}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Create Date",
            accessor: "create_date",
            width: "180px",
            render: (value: string) => {
                if (!value) return "-";
                return new Date(value).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
            },
        },
    ];



    return (
        <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ">

            <div className="z-20">
                <SearchDynamicHeader
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                    fields={fields}
                />
            </div>


            <div className="flex-1 min-h-0 pt-3">
                <ScrollableTable
                    columns={columns}
                    data={stocks}
                    loading={loading}
                    className="h-full border-0 shadow-none"
                    height="100%"
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={(newPage) => fetchStocks({ page: newPage })}
                    onEdit={(data) => {
                        setDetail(data);
                        setOpenModalDetail(true)

                    }
                    }
                    onDelete={handleDeleteStock}
                />
            </div>


            {openModalDetail && (
                <ModalDetail
                    data={detail}
                    isOpen={openModalDetail}
                    onClose={handleModalClose}
                    onUpdated={handleStockUpdated}
                />
            )}
        </div>
    );
}
