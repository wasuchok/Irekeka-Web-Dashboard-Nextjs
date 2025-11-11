"use client";

import ModalDetail from "@/app/components/report/ModalDetail";
import { ScrollableTable } from "@/app/components/report/table";
import { IMAGE_URL } from "@/app/config/variable";
import { apiPublic } from "@/app/services/httpClient";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SearchDynamicHeader = dynamic(
    () => import("@/app/components/report/SearchHeader"),
    { ssr: false }
);

export default function Page() {
    const [openModalDetail, setOpenModalDetail] = useState(false)
    const [stocks, setStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<any>(null);
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
            enumValues: ["Computer", "Equipment", "Accessory", "Phone/Camera", "Other"],
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

    const handleCreate = () => alert("🟢 Create clicked");


    useEffect(() => {
        fetchStocks();
    }, []);

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
                />
            </div>


            {openModalDetail && (
                <ModalDetail data={detail} isOpen={openModalDetail} onClose={() => setOpenModalDetail(false)} />
            )}
        </div>
    );
}
