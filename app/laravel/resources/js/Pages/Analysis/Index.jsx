import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";

export default function Analysis({
    auth,
    summary,
    chartData,
}) {

    const [year, setYear] = useState(summary.year);
    const [month, setMonth] = useState(summary.month);

    const occupancyData = (chartData ?? []).map((item) => ({
        month: item.month,
        current: item.occupancy,
        previous: item.previous_occupancy,
    }));

    const salesData = (chartData ?? []).map((item) => ({
        month: item.month,
        current: item.sales,
        previous: item.previous_sales,
    }));



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    集計
                </h2>
            }
        >
            <Head title="集計" />

            <div className="py-6 bg-gray-100 min-h-screen">
                <div className="mx-auto max-w-7xl space-y-6">


                    {/* =========================
                        年間グラフ
                    ========================== */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* 稼働率 */}
                        <div className="bg-white rounded-xl shadow border p-6">
                            <h3 className="font-bold text-lg mb-5">
                                年間稼働率
                            </h3>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <LineChart
                                    data={occupancyData}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="month"
                                    />
                                    <YAxis
                                        unit="%"
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="current"
                                        name="今年度"
                                        stroke="#111827"
                                        strokeWidth={3}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="previous"
                                        name="前年度"
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 売上 */}
                        <div className="bg-white rounded-xl shadow border p-6">
                            <h3 className="font-bold text-lg mb-5">
                                年間売上合計
                            </h3>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <LineChart
                                    data={salesData}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="month"
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="current"
                                        name="今年度"
                                        stroke="#111827"
                                        strokeWidth={3}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="previous"
                                        name="前年度"
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    
                    {/* =========================
                        月別集計
                    ========================== */}
                    <div className="bg-white rounded-xl shadow border">
                        <div className="p-6 border-b">
                            <div className="flex items-end gap-4">

                                {/* 年 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        年
                                    </label>

                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="border rounded px-3 py-2 pr-8"
                                    >
                                        {[2024,2025,2026,2027].map(y=>(
                                            <option key={y} value={y}>
                                                {y}年
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 月 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        月
                                    </label>

                                    <select
                                        value={month}
                                        onChange={(e)=>setMonth(e.target.value)}
                                        className="border rounded px-3 py-2 pr-8"
                                    >
                                        {Array.from({length:12},(_,i)=>(
                                            <option key={i+1} value={i+1}>
                                                {i+1}月
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={() =>
                                        router.get(route('analysis.index'), {
                                            year,
                                            month,
                                        })
                                    }
                                >
                                    表示
                                </button>
                            </div>
                        </div>

                        {/* 月別カード */}
                        <div className="grid grid-cols-3 gap-6 p-6">

                            {/* 稼働率 */}
                            <div className="rounded-xl border shadow-sm p-6 flex flex-col justify-between">
                                <div>
                                    <p className="text-gray-500">
                                        稼働率
                                    </p>

                                    <p className="text-4xl font-bold mt-3">
                                        {summary.occupancy_rate}%
                                    </p>

                                    <p className="text-gray-500 mt-2">
                                        {summary.used_rooms} /
                                        {" "}
                                        {summary.total_rooms}
                                        {" "}
                                        部屋
                                    </p>
                                </div>
                            </div>

                            {/* 売上 */}
                            <div className="rounded-xl border shadow-sm p-6 flex flex-col justify-between">
                                <div>
                                    <p className="text-gray-500">
                                        売上合計
                                    </p>

                                    <p className="text-4xl font-bold mt-3">
                                        ¥
                                        {Number(summary.sales).toLocaleString()}
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <Link
                                        href={route(
                                            "analysis.daily",
                                            {
                                                year,
                                                month,
                                            }
                                        )}
                                        className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
                                    >
                                        詳細
                                    </Link>
                                </div>
                            </div>

                            {/* 宿泊人数 */}
                            <div className="rounded-xl border shadow-sm p-6 flex flex-col justify-between">
                                <div>
                                    <p className="text-gray-500">
                                        合計宿泊人数
                                    </p>

                                    <p className="text-4xl font-bold mt-3">
                                        {summary.guest_count}
                                        人
                                    </p>

                                    <p className="text-gray-500 mt-2">
                                        大人：
                                        {summary.adult_count}
                                        人
                                        {" / "}
                                        子ども：
                                        {summary.child_count}
                                        人
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
