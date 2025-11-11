"use client"
import { ScrollableTable } from "@/app/components/report/table";
import SearchDynamicHeader from "@/app/components/stock/SearchHeader";
import { apiPublic } from "@/app/services/httpClient";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface BorrowedRecord {
    record_seq: number;
    name: string;
    img_1?: string | null;
    img_2?: string | null;
    user_out_name?: string | null;
    user_in_name?: string | null;
    date_out?: string | null;
    date_in?: string | null;
    status: string;
    borrow_days?: number | null;
    remaining_days?: number | null;
    due_date?: string | null;
    stock_status?: string | null;
}

interface BorrowedEquipmentsApiResponse {
    success: boolean;
    data: BorrowedRecord[];
    pagination?: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

const sanitizeParams = (params: Record<string, any>) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ""
        )
    )

const toFiniteNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const normalizeBorrowedRecord = (record: any): BorrowedRecord => {
    const seq = Number(record?.record_seq)
    return {
        ...record,
        record_seq: Number.isFinite(seq) ? seq : 0,
        borrow_days: toFiniteNumber(record?.borrow_days),
        remaining_days: toFiniteNumber(record?.remaining_days),
    }
}

const formatDate = (value?: string | null) => {
    if (!value || value === "-") return "-"

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return "-"
    return parsed.toISOString().split("T")[0]
}

const formatRemainingMessage = (value?: number | null, status?: string | null) => {
    if (status?.toLowerCase() === "returned") {
        return { label: "คืนแล้ว", color: "text-green-600" }
    }

    const numericValue = typeof value === "number" ? value : Number(value)

    if (value === null || value === undefined || Number.isNaN(numericValue)) {
        return { label: "-", color: "text-gray-600" }
    }

    if (numericValue === 0) {
        return { label: "ถึงกำหนดคืนวันนี้", color: "text-amber-600" }
    }

    if (numericValue > 0) {
        return { label: `เหลืออีก ${numericValue} วัน`, color: "text-blue-700" }
    }

    return { label: `เกินกำหนด ${Math.abs(numericValue)} วัน`, color: "text-red-600" }
}

const DEFAULT_PAGINATION = {
    totalPages: 1,
    currentPage: 1,
}

export default function Page() {
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState<BorrowedRecord[]>([])
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
    const router = useRouter()
    const columns: any[] = [
        {
            header: "No.",
            accessor: "record_seq",
            width: "70px",
            render: (value: number) => value ?? "-",
        },
        {
            header: "Name",
            accessor: "name",
            width: "180px",
            render: (value: string) => value || "-",
        },
        {
            header: "Borrow Date",
            accessor: "date_out",
            width: "130px",
            render: (value: string) => formatDate(value),
        },
        {
            header: "Return Date",
            accessor: "date_in",
            width: "130px",
            render: (value: string | null) => {
                const formatted = formatDate(value ?? undefined)
                return formatted === "-" ? <span className="text-gray-400 italic">-</span> : formatted
            },
        },
        {
            header: "Borrower",
            accessor: "user_out_name",
            width: "200px",
            render: (value: string) => value || "-",
        },
        {
            header: "Return By",
            accessor: "user_in_name",
            width: "200px",
            render: (value: string | null) => value || "-",
        },
        {
            header: "Status",
            accessor: "status",
            width: "140px",
            render: (value: string) => {
                const isReturned = value === "Returned";
                return (
                    <span className={isReturned ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                        {value || "-"}
                    </span>
                );
            },
        },
        {
            header: "Borrowed (Days)",
            accessor: "borrow_days",
            width: "150px",
            render: (value: number | null) => {
                const numericValue = typeof value === "number" ? value : Number(value)
                return Number.isFinite(numericValue) ? `${numericValue} วัน` : "-"
            },
        },
        {
            header: "Due Date",
            accessor: "due_date",
            width: "150px",
            render: (value: string | null) => formatDate(value),
        },
        {
            header: "Remaining (Days)",
            accessor: "remaining_days",
            width: "170px",
            render: (value: number | null, row: BorrowedRecord) => {
                const { label, color } = formatRemainingMessage(value, row?.status)
                return <span className={`font-semibold ${color}`}>{label}</span>
            },
        },
    ];

    const fetchRecords = useCallback(async (params: Record<string, any> = {}) => {
        try {
            setLoading(true)
            const cleanedParams = sanitizeParams(params)
            const page = Number(cleanedParams.page) || 1
            const limit = Number(cleanedParams.limit) || 10

            const { data, status } = await apiPublic.get<BorrowedEquipmentsApiResponse>("/record", {
                params: {
                    ...cleanedParams,
                    page,
                    limit,
                },
            })

            if (status === 200 && data.success) {
                const normalized = (data.data || []).map(normalizeBorrowedRecord)
                setRecords(normalized)
                const totalPages = Math.max(data.pagination?.totalPages ?? 1, 1)
                const currentPage = Math.min(data.pagination?.currentPage ?? page, totalPages)
                setPagination({
                    totalPages,
                    currentPage,
                })
            }
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRecords({ page: 1 })
    }, [fetchRecords])

    const fields = [
        { accessor: "equipment_name", header: "Equipment Name", type: "text" },
        { accessor: "user_out_name", header: "Borrower", type: "text" },
        { accessor: "user_in_name", header: "Return By", type: "text" },
        {
            accessor: "status",
            header: "Status",
            type: "dropdown",
            enumValues: ["Returned", "Not Returned"],
        },
    ];

    const handleSearch = (values: Record<string, any>) => {
        const nextFilters = sanitizeParams(values)
        setFilters(nextFilters)
        console.log("🔍 ค้นหา:", nextFilters)
        fetchRecords({ ...nextFilters, page: 1 })
    };


    const handleReset = () => {
        setFilters({})
        console.log("♻️ รีเซ็ตฟอร์มแล้ว")
        fetchRecords({ page: 1 })
    };

    const handlePageChange = (page: number) => {
        fetchRecords({ ...filters, page })
    }

    const handleCreate = () => router.push("/stock/create");

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
                    data={records}
                    loading={loading}
                    className="h-full border-0 shadow-none"
                    height="100%"
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}

                />
            </div>


        </div>
    )
}
