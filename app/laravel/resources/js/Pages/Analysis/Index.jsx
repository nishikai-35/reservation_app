import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
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
    // console.log(summary);

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
        >
            <Head title="集計" />
            <div
                className="min-h-screen bg-cover bg-center bg-fixed py-8"
                style={{backgroundImage: "url('/images/dashboard-bg.jpg')",}}
            >
                <div className="mx-auto max-w-7xl rounded-2xl bg-white/70 p-6 backdrop-blur-sm">

                    {/* タイトル */}
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                集計
                            </h1>
                            <p className="mt-2 text-gray-500">
                                年月日の宿泊状況の集計を確認できます。
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* 年間グラフ */}
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
                                        <YAxis 
                                            width={70}
                                            allowDecimals={false}                                        
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
                        </div>
                        
                        {/* 月別集計 */}
                        <div className="bg-white rounded-xl shadow border">
                            <div className="p-6 border-b bg-gray-50 rounded-t-xl">
                                <h3 className="text-lg font-semibold text-gray-800 mb-5">
                                    集計条件
                                </h3>

                                <div className="flex items-end gap-5 flex-wrap">

                                    {/* 年 */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            年
                                        </label>

                                        <select
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="w-40 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            月
                                        </label>

                                        <select
                                            value={month}
                                            onChange={(e)=>setMonth(e.target.value)}
                                            className="w-32 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                                            router.get(route("analysis.index"), {
                                                year,
                                                month,
                                            })
                                        }
                                        className="h-[46px] rounded-lg bg-blue-600 px-8 text-white font-medium shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-0"
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
            </div>
        </AuthenticatedLayout>
    );
}
