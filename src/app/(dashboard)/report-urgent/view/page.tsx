"use client";

import SearchDynamicHeader from "@/app/components/record/SearchHeader";
import { ScrollableTable } from "@/app/components/report/table";
import { IMAGE_URL } from "@/app/config/variable";
import { apiPublic } from "@/app/services/httpClient";
import { useCallback, useEffect, useState } from "react";

interface UrgentRecord {
    seq: number;
    code: string;
    date_out: string | null;
    date_in: string | null;
    user_out: string | null;
    user_in: string | null;
    it_out: string | null;
    it_in: string | null;
    num_date: number | null;
    image_url: string | null;
    user_out_name: string | null;
    user_out_section: string | null;
    user_in_name: string | null;
    status: string | null;
}

interface UrgentApiResponse {
    success: boolean;
    duration?: string;
    timestamp?: string;
    data: UrgentRecord[];
}

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatDays = (value: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "-";
    return `${value} วัน`;
};

const getImageSrc = (image?: string | null) => {
    if (!image) return null;
    return `${IMAGE_URL}${image}`;
};

const sanitizeParams = (params: Record<string, any>) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ""
        )
    );

export default function Page() {
    const [records, setRecords] = useState<UrgentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Record<string, any>>({});

    const fetchUrgentRecords = useCallback(async (params: Record<string, any> = {}) => {
        const cleaned = sanitizeParams(params);
        const requestParams: Record<string, string> = {};
        if (cleaned.user_out) {
            requestParams.user_out = cleaned.user_out;
        }
        if (cleaned.status) {
            requestParams.status = cleaned.status;
        }
        if (cleaned.date_out_from) {
            requestParams.date_from = cleaned.date_out_from;
        }
        if (cleaned.date_out_to) {
            requestParams.date_to = cleaned.date_out_to;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await apiPublic.get<UrgentApiResponse>(
                "/borrow-urgent/admin",
                {
                    params: requestParams,
                }
            );

            if (response.status === 200 && response.data.success) {
                setRecords(response.data.data || []);
            } else {
                setRecords([]);
                setError("Unable to load urgent report data right now.");
                console.error("Invalid success flag", response.data);
            }
        } catch (err) {
            setRecords([]);
            setError("An error occurred while fetching urgent report data.");
            console.error("Fetch urgent admin error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUrgentRecords();
    }, [fetchUrgentRecords]);

    const fields = [
        { accessor: "user_out", header: "Requester ID", type: "text" },
        {
            accessor: "status",
            header: "Status",
            type: "dropdown",
            enumValues: [
                { label: "Not Returned", value: "borrowed" },
                { label: "Returned", value: "returned" },
            ],
        },
        { accessor: "date_out", header: "Date Out", type: "date-range" },
    ];

    const columns = [
        {
            header: "#",
            accessor: "seq" as const,
            width: "70px",
        },
        {
            header: "Code",
            accessor: "code" as const,
            width: "160px",
        },
        {
            header: "Requester",
            accessor: "user_out_name" as const,
            width: "200px",
            render: (value: string | null) => value || "-",
        },
        {
            header: "Department",
            accessor: "user_out_section" as const,
            width: "140px",
            render: (value: string | null) => value || "-",
        },
        {
            header: "Status",
            accessor: "status" as const,
            width: "140px",
            render: (value: string | null) => {
                const normalized = value?.toLowerCase() ?? "";
                const isReturned = normalized.includes("return");
                if (isReturned) {
                    return (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            Returned
                        </span>
                    );
                }
                return (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                        Not Returned
                    </span>
                );
            },
        },
        {
            header: "Date Out",
            accessor: "date_out" as const,
            width: "140px",
            render: (value: string | null) => formatDate(value),
        },
        {
            header: "Date In",
            accessor: "date_in" as const,
            width: "140px",
            render: (value: string | null, row?: UrgentRecord) => {
                const hasReturnInfo = Boolean(row?.user_in && row?.it_in);
                if (!value || !hasReturnInfo) {
                    return (
                        <span className="font-semibold text-red-600">
                            Not returned
                        </span>
                    );
                }
                return (
                    <span className="flex flex-col text-sm font-semibold text-gray-900">
                        <span>{formatDate(value)}</span>
                        <span className="text-xs text-gray-500">Returned</span>
                    </span>
                );
            },
        },
        {
            header: "Borrow Days",
            accessor: "num_date" as const,
            width: "120px",
            render: (value: number | null) => formatDays(value),
        },
        {
            header: "Returned By",
            accessor: "user_in_name" as const,
            width: "180px",
            render: (value: string | null) => value || "-",
        },
        {
            header: "Photo",
            accessor: "image_url" as const,
            width: "120px",
            render: (value: string | null, row?: UrgentRecord) => {
                const src = getImageSrc(value);
                if (!src) return "-";
                return (
                    <img
                        src={src}
                        alt={`${row?.code ?? "urgent"}-thumb`}
                        className="h-16 w-16 rounded-md border border-gray-200 object-cover"
                    />
                );
            },
        },
    ];

    const handleSearch = (values: Record<string, any>) => {
        const nextFilters = sanitizeParams(values);
        setFilters(nextFilters);
        fetchUrgentRecords(nextFilters);
    };

    const handleReset = () => {
        setFilters({});
        fetchUrgentRecords({});
    };

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-lg font-semibold text-gray-900">
                        Urgent Borrow Report
                    </p>
                    <p className="text-sm text-gray-500">
                        Displays urgent borrow requests that are still outstanding, powered by the admin service.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => fetchUrgentRecords(filters)}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-md border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            <SearchDynamicHeader
                fields={fields}
                onSearch={handleSearch}
                onReset={handleReset}
            />

            <div className="flex-1 min-h-0">
                <ScrollableTable
                    columns={columns}
                    data={records}
                    loading={loading}
                    className="h-full border-0 shadow-none"
                    height="100%"
                    currentPage={1}
                    totalPages={1}
                    onPageChange={() => {}}
                />
            </div>

            {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
