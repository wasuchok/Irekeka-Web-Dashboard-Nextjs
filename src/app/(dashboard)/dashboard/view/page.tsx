"use client";

import { apiPublic } from "@/app/services/httpClient";
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import {
    FiAlertCircle,
    FiBookOpen,
    FiClock,
    FiDownloadCloud,
    FiRefreshCw
} from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface DashboardStats {
    totalEquipments: number;
    borrowed: number;
    lateReturns: number;
    maintenance: number;
}

interface TrendPoint {
    label: string;
    value: number;
}

interface ComplianceSlice {
    count: number;
    percent: number;
}

interface ComplianceResponse {
    onTime: ComplianceSlice;
    dueToday: ComplianceSlice;
    overdue: ComplianceSlice;
}

interface UpcomingReturn {
    code: string;
    asset: string;
    borrower: string;
    dueDate: string;
    statusText: string;
}

type ActivityType = "borrow" | "return";

interface RecentActivity {
    recordSeq: number;
    asset: string;
    user: string;
    actionType: ActivityType;
    actionDate: string;
    message: string;
}

interface StatCardMeta {
    key: keyof DashboardStats;
    label: string;
    subLabel: string;
    icon: React.ReactNode;

}

const STAT_CARD_META: StatCardMeta[] = [
    {
        key: "totalEquipments",
        label: "Total Equipments",
        subLabel: "Active items in the system",

        icon: <FiBookOpen className="text-2xl text-primary-600" />,
    },
    {
        key: "borrowed",
        label: "Borrowed",
        subLabel: "Checked-out right now",

        icon: <FiClock className="text-2xl text-primary-600" />,
    },
    {
        key: "lateReturns",
        label: "Late Returns",
        subLabel: "Require follow-up",

        icon: <FiAlertCircle className="text-2xl text-primary-600" />,
    },
    {
        key: "maintenance",
        label: "Maintenance",
        subLabel: "In repair process",

        icon: <FiRefreshCw className="text-2xl text-primary-600" />,
    },
];

const FALLBACK_TREND: TrendPoint[] = [
    { label: "Mon", value: 0 },
    { label: "Tue", value: 0 },
    { label: "Wed", value: 0 },
    { label: "Thu", value: 0 },
    { label: "Fri", value: 0 },
    { label: "Sat", value: 0 },
    { label: "Sun", value: 0 },
];

const FALLBACK_COMPLIANCE: ComplianceResponse = {
    onTime: { count: 0, percent: 0 },
    dueToday: { count: 0, percent: 0 },
    overdue: { count: 0, percent: 0 },
};

const formatNumber = (value?: number) => (typeof value === "number" ? value.toLocaleString("en-US") : "-");

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
};

const differenceInDays = (dueDate: string) => {
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return null;
    const diff = due.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
    return Math.round(diff / (1000 * 60 * 60 * 24));
};

const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [trend, setTrend] = useState<TrendPoint[]>([]);
    const [compliance, setCompliance] = useState<ComplianceResponse | null>(null);
    const [upcoming, setUpcoming] = useState<UpcomingReturn[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                statsRes,
                trendRes,
                complianceRes,
                upcomingRes,
                activitiesRes,
            ] = await Promise.all([
                apiPublic.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
                apiPublic.get<ApiResponse<TrendPoint[]>>("/dashboard/borrowing-trend"),
                apiPublic.get<ApiResponse<ComplianceResponse>>("/dashboard/compliance"),
                apiPublic.get<ApiResponse<UpcomingReturn[]>>("/dashboard/upcoming-returns"),
                apiPublic.get<ApiResponse<RecentActivity[]>>("/dashboard/recent-activities"),
            ]);

            if (statsRes.data?.success) setStats(statsRes.data.data);
            if (trendRes.data?.success) setTrend(trendRes.data.data ?? []);
            if (complianceRes.data?.success) setCompliance(complianceRes.data.data);
            if (upcomingRes.data?.success) setUpcoming(upcomingRes.data.data ?? []);
            if (activitiesRes.data?.success) setActivities(activitiesRes.data.data ?? []);
        } catch (err) {
            console.error("Dashboard API error:", err);
            setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
        } finally {
            setLoading(false);
        }
    };

    const totalBorrowed = useMemo(
        () => (trend.length ? trend : FALLBACK_TREND).reduce((sum, day) => sum + day.value, 0),
        [trend]
    );

    const statCards = useMemo(
        () =>
            STAT_CARD_META.map((meta) => ({
                ...meta,
                value: formatNumber(stats?.[meta.key]),
            })),
        [stats]
    );

    const trendSource = trend.length ? trend : FALLBACK_TREND;

    const borrowingTrendChart = useMemo(
        () => ({
            labels: trendSource.map((day) => day.label),
            datasets: [
                {
                    label: "Borrowed",
                    data: trendSource.map((day) => day.value),
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.15)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: "#1d4ed8",
                },
            ],
        }),
        [trendSource]
    );

    const borrowingTrendOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#0f172a",
                    titleFont: { size: 12 },
                    bodyFont: { size: 12 },
                    padding: 10,
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#6b7280", font: { size: 12 } },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(148, 163, 184, 0.2)" },
                    ticks: { color: "#6b7280", stepSize: 10 },
                },
            },
        }),
        []
    );

    const complianceSource = compliance ?? FALLBACK_COMPLIANCE;

    const complianceChartData = useMemo(
        () => ({
            labels: ["On-Time", "Due Today", "Overdue"],
            datasets: [
                {
                    data: [
                        complianceSource.onTime.count,
                        complianceSource.dueToday.count,
                        complianceSource.overdue.count,
                    ],
                    backgroundColor: ["#34d399", "#fbbf24", "#ef4444"],
                    borderWidth: 0,
                },
            ],
        }),
        [complianceSource]
    );

    const complianceBreakdown = useMemo(
        () => [
            { label: "On-Time", color: "#34d399", ...complianceSource.onTime },
            { label: "Due Today", color: "#fbbf24", ...complianceSource.dueToday },
            { label: "Overdue", color: "#ef4444", ...complianceSource.overdue },
        ],
        [complianceSource]
    );

    const derivedAlerts = useMemo(() => {
        const dueWithinSeven = upcoming.filter((item) => {
            const diff = differenceInDays(item.dueDate);
            return diff !== null && diff >= 0 && diff <= 7;
        }).length;

        const borrowerCounts = activities
            .filter((activity) => activity.actionType === "borrow")
            .reduce<Record<string, { user: string; count: number }>>((acc, activity) => {
                const key = activity.user || "ไม่ระบุ";
                acc[key] = acc[key]
                    ? { user: key, count: acc[key].count + 1 }
                    : { user: key, count: 1 };
                return acc;
            }, {});

        const topBorrower = Object.values(borrowerCounts).sort((a, b) => b.count - a.count)[0];

        return [
            {
                label: "Due this week",
                value: dueWithinSeven,
                desc: "Items need follow-up before Friday",
                emphasis:
                    dueWithinSeven > 0 ? `${dueWithinSeven} รายการต้องติดตาม` : "ยังไม่มีรายการใกล้ครบกำหนด",
                tone: "amber" as const,
            },
            {
                label: "Top borrower",
                value: topBorrower?.count ?? 0,
                desc: "Users borrowed most items this week",
                emphasis: topBorrower ? `${topBorrower.user} (${topBorrower.count} รายการ)` : "ยังไม่มีผู้ยืมซ้ำ",
                tone: "blue" as const,
            },
            {
                label: "Late follow-ups",
                value: stats?.lateReturns ?? 0,
                desc: "Awaiting IT action",
                emphasis:
                    (stats?.lateReturns ?? 0) > 0
                        ? `${stats?.lateReturns ?? 0} รายการเกินกำหนด`
                        : "ทุกอย่างอยู่ในเกณฑ์ปลอดภัย",
                tone: "purple" as const,
            },
        ];
    }, [activities, upcoming, stats]);

    return (
        <div className="space-y-6">
            <header
                className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"
                data-aos="fade-down"
            >
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary-500">Dashboard</p>
                    <h1 className="text-3xl font-semibold text-gray-900">Equipment overview</h1>
                    <p className="mt-1 text-sm text-gray-500">Quick snapshot of inventory health and borrowing activities.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        onClick={fetchDashboardData}
                        disabled={loading}
                    >
                        <FiDownloadCloud className="mr-2" />
                        {loading ? "Refreshing..." : "Sync now"}
                    </button>

                </div>
            </header>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card, index) => (
                    <article
                        key={card.label}
                        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                        data-aos="zoom-in"
                        data-aos-delay={index * 80}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{card.label}</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">{card.value}</p>
                            </div>
                            <span className="rounded-xl bg-primary-50 p-3 text-primary-600">{card.icon}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-medium text-gray-500">
                            <span>{card.subLabel}</span>

                        </div>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-aos="fade-up">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Borrowing trend</h2>
                            <p className="text-sm text-gray-500">Weekly movement of check-outs</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {totalBorrowed} total
                        </span>
                    </div>
                    <div className="mt-6 h-64">
                        <Line data={borrowingTrendChart} options={borrowingTrendOptions} />
                    </div>
                </article>

                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-aos="fade-up" data-aos-delay="120">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Return compliance</h2>
                            <p className="text-sm text-gray-500">How the team performs against due dates</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-500">Monthly</span>
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row lg:items-center">
                        <div className="h-48 w-48">
                            <Doughnut data={complianceChartData} options={{ cutout: "70%", plugins: { legend: { display: false } } }} />
                        </div>
                        <div className="space-y-3">
                            {complianceBreakdown.map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {item.label} ({item.percent}%)
                                        </span>
                                        <span className="text-xs text-gray-500">{item.count} รายการ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                        <strong className="text-gray-900">Reminder:</strong> Send follow-up to overdue users twice per week for
                        better SLA compliance.
                    </div>
                </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-aos="fade-up">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Upcoming returns</h2>

                    </div>
                    {upcoming.length === 0 && !loading ? (
                        <p className="mt-6 text-sm text-gray-500">ยังไม่มีรายการที่จะครบกำหนด</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {upcoming.slice(0, 10).map((item) => {
                                const remaining = differenceInDays(item.dueDate);
                                const statusColor =
                                    remaining === null
                                        ? "text-gray-500"
                                        : remaining < 0
                                            ? "text-red-500"
                                            : remaining === 0
                                                ? "text-blue-600"
                                                : "text-amber-600";

                                return (
                                    <div
                                        key={`${item.code}-${item.borrower}-${item.dueDate}`}
                                        className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{item.asset}</p>
                                            <p className="text-xs text-gray-500">{item.borrower}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">{formatDate(item.dueDate)}</p>
                                            <p className={`text-xs ${statusColor}`}>{item.statusText}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </article>

                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-aos="fade-left" data-aos-delay="120">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Alerts & focus</h2>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">This week</span>
                    </div>
                    <div className="mt-5 space-y-4">
                        {derivedAlerts.map((alert) => (
                            <div
                                key={alert.label}
                                className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{alert.label}</p>
                                        <p className="text-xs text-gray-500">{alert.desc}</p>
                                    </div>
                                    <span
                                        className={`text-lg font-bold ${alert.tone === "amber"
                                            ? "text-amber-500"
                                            : alert.tone === "purple"
                                                ? "text-purple-500"
                                                : "text-blue-600"
                                            }`}
                                    >
                                        {alert.value}
                                    </span>
                                </div>
                                <p className="mt-3 text-xs font-semibold text-gray-600">{alert.emphasis}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
};

export default DashboardPage;
