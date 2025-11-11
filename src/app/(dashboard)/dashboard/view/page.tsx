"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { useMemo } from "react";
import {
    FiAlertCircle,
    FiBookOpen,
    FiClock,
    FiDownloadCloud,
    FiRefreshCw,
    FiTrendingDown,
    FiTrendingUp,
} from "react-icons/fi";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

interface StatCard {
    label: string;
    value: string;
    subLabel: string;
    trend: {
        value: string;
        isPositive: boolean;
    };
    icon: React.ReactNode;
}

const statCards: StatCard[] = [
    {
        label: "Total Equipments",
        value: "428",
        subLabel: "Active items in the system",
        trend: { value: "+8% this month", isPositive: true },
        icon: <FiBookOpen className="text-2xl text-blue-600" />,
    },
    {
        label: "Borrowed",
        value: "116",
        subLabel: "Checked-out right now",
        trend: { value: "+4 from yesterday", isPositive: true },
        icon: <FiClock className="text-2xl text-amber-500" />,
    },
    {
        label: "Late Returns",
        value: "9",
        subLabel: "Require follow-up",
        trend: { value: "-3 overdue week", isPositive: true },
        icon: <FiAlertCircle className="text-2xl text-red-500" />,
    },
    {
        label: "Maintenance",
        value: "18",
        subLabel: "In repair process",
        trend: { value: "+2 scheduled", isPositive: false },
        icon: <FiRefreshCw className="text-2xl text-purple-500" />,
    },
];

const borrowingTrend = [
    { label: "Mon", value: 32 },
    { label: "Tue", value: 44 },
    { label: "Wed", value: 39 },
    { label: "Thu", value: 55 },
    { label: "Fri", value: 48 },
    { label: "Sat", value: 28 },
    { label: "Sun", value: 23 },
];

const complianceData = [
    { label: "On-Time", value: 72, color: "#34d399" },
    { label: "Due Today", value: 18, color: "#fbbf24" },
    { label: "Overdue", value: 10, color: "#ef4444" },
];

const upcomingReturns = [
    { asset: "NB6", borrower: "ผกามาศ โคตะถา", dueDate: "2025-11-19", status: "Due in 2 days" },
    { asset: "NB3", borrower: "พชรพร TM", dueDate: "2025-11-19", status: "Due in 2 days" },
    { asset: "IPhone 12", borrower: "วสุโชค ใจน้ำ", dueDate: "2025-11-20", status: "Due in 3 days" },
    { asset: "Projector P9", borrower: "วาสนา IT", dueDate: "2025-11-22", status: "Due in 5 days" },
];

const recentActivity = [
    { action: "NB7 returned by สมสักดิ์ IT", timestamp: "Just now", type: "positive" },
    { action: "New request submitted by อัญชลี HR", timestamp: "15 mins ago", type: "info" },
    { action: "Reminder sent to พรธี EF", timestamp: "1 hr ago", type: "warning" },
    { action: "Maintenance completed for NB2", timestamp: "Yesterday", type: "positive" },
];

const DashboardPage = () => {
    const totalBorrowed = useMemo(() => borrowingTrend.reduce((sum, day) => sum + day.value, 0), []);

    const borrowingTrendChart = useMemo(() => ({
        labels: borrowingTrend.map((day) => day.label),
        datasets: [
            {
                label: "Borrowed",
                data: borrowingTrend.map((day) => day.value),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.15)",
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: "#1d4ed8",
            },
        ],
    }), []);

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

    const complianceChartData = useMemo(
        () => ({
            labels: complianceData.map((item) => item.label),
            datasets: [
                {
                    data: complianceData.map((item) => item.value),
                    backgroundColor: complianceData.map((item) => item.color),
                    borderWidth: 0,
                },
            ],
        }),
        []
    );

    const complianceOptions = useMemo(
        () => ({
            cutout: "70%",
            plugins: {
                legend: {
                    display: false,
                },
            },
        }),
        []
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">Dashboard</p>
                    <h1 className="text-2xl font-bold text-gray-900">Equipment overview</h1>
                    <p className="text-sm text-gray-500">Quick snapshot of inventory health and borrowing activities.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        <FiDownloadCloud className="mr-2" /> Export Report
                    </button>
                    <button className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                        <FiBookOpen className="mr-2" /> New Request
                    </button>
                </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <article key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <span className="rounded-2xl bg-blue-50 p-2">{card.icon}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-medium">
                            <span className="text-gray-500">{card.subLabel}</span>
                            <span className={card.trend.isPositive ? "text-green-600" : "text-red-500"}>
                                {card.trend.isPositive ? <FiTrendingUp className="inline" /> : <FiTrendingDown className="inline" />}{" "}
                                {card.trend.value}
                            </span>
                        </div>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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

                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Return compliance</h2>
                            <p className="text-sm text-gray-500">How the team performs against due dates</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-500">Monthly</span>
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row lg:items-center">
                        <div className="h-48 w-48">
                            <Doughnut data={complianceChartData} options={complianceOptions} />
                        </div>
                        <div className="space-y-3">
                            {complianceData.map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                                        <span className="text-xs text-gray-500">{item.value}% of total</span>
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
                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Upcoming returns</h2>
                        <button className="text-sm font-semibold text-blue-600 hover:underline">View all</button>
                    </div>
                    <div className="mt-4 space-y-4">
                        {upcomingReturns.map((item) => (
                            <div key={`${item.asset}-${item.borrower}`} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{item.asset}</p>
                                    <p className="text-xs text-gray-500">{item.borrower}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{item.dueDate}</p>
                                    <p className="text-xs text-amber-600">{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
                        <button className="text-sm font-semibold text-blue-600 hover:underline">More logs</button>
                    </div>
                    <ul className="mt-4 space-y-4">
                        {recentActivity.map((activity) => (
                            <li key={activity.action} className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                                <span
                                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                        activity.type === "positive"
                                            ? "bg-green-500"
                                            : activity.type === "warning"
                                                ? "bg-amber-400"
                                                : "bg-blue-500"
                                    }`}
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </article>
            </section>
        </div>
    );
};

export default DashboardPage;
