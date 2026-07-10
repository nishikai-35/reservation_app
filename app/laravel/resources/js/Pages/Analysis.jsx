import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';


export default function Analysis({
    auth,
    summary,
    dailyData,
    monthlyData,
    comparisonData,
}) {
    
    return (

        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    集計分析
                </h2>
            }
        >

            <Head title="集計分析" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="mb-6 text-2xl font-bold">
                        {summary.year}年{summary.month}月 分析
                    </h1>



                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* 売上 */}

                        <div className="rounded-lg bg-white p-6 shadow">

                            <h2 className="text-gray-500">
                                売上合計
                            </h2>

                            <p className="mt-2 text-3xl font-bold">
                                {summary.sales.toLocaleString()}
                                円
                            </p>
                        </div>




                        {/* 宿泊人数 */}

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-gray-500">
                                宿泊人数
                            </h2>

                            <p className="mt-2 text-3xl font-bold">
                                {summary.guests}
                                人
                            </p>
                        </div>




                        {/* 予約件数 */}

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-gray-500">
                                予約件数
                            </h2>

                            <p className="mt-2 text-3xl font-bold">
                                {summary.reservation_count}
                                件
                            </p>
                        </div>




                        {/* 稼働率 */}

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-gray-500">
                                稼働率
                            </h2>

                            <p className="mt-2 text-3xl font-bold">
                                {summary.occupancy_rate}
                                %
                            </p>
                        </div>
                    </div>

                    {/* 年間売上グラフ */}
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold">
                            年間売上推移
                        </h2>
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    name="売上"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 年間稼働率グラフ */}
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold">
                            年間稼働率推移
                        </h2>
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => `${value}%`}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="occupancy_rate"
                                    name="稼働率"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 売上比較グラフ */}
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold">
                            前年比較（売上）
                        </h2>

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <LineChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="current_sales"
                                    name={`${summary.year}年`}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="previous_sales"
                                    name={`${summary.year - 1}年`}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 稼働率比較グラフ */}
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold">
                            前年比較（稼働率）
                        </h2>
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <LineChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => `${value}%`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="current_occupancy"
                                    name={`${summary.year}年`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="previous_occupancy"
                                    name={`${summary.year - 1}年`}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* CSV出力ボタン */}
                    <div className="mt-6">
                        <a
                            href={route('analysis.export')}
                            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            CSV出力
                        </a>
                    </div>

                    
                    <div className="mt-8">
                        <h2 className="mb-4 text-xl font-bold">
                            日別集計
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">

                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2">
                                            日付
                                        </th>

                                        <th className="border p-2">
                                            売上
                                        </th>

                                        <th className="border p-2">
                                            宿泊人数
                                        </th>

                                        <th className="border p-2">
                                            稼働率
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dailyData.map((day) => (
                                        <tr key={day.date}>
                                            <td className="border p-2">
                                                {day.date}
                                            </td>
                                    
                                            <td className="border p-2 text-right">
                                                {day.sales.toLocaleString()}
                                                円
                                            </td>
                                    
                                            <td className="border p-2 text-right">
                                                {day.guests}
                                                人
                                            </td>
                                    
                                            <td className="border p-2 text-right">
                                                {day.occupancy_rate}
                                                %
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>

    );

}