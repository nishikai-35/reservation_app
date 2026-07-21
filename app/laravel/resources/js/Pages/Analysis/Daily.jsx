import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Daily({
    auth,
    year,
    month,
    dailyData,
}) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold">
                    日別集計
                </h2>
            }
        >
            <Head title="日別集計" />

            <div className="h-[calc(100vh-90px)] bg-gray-100 p-6">
                <div className="bg-white rounded-xl shadow h-full flex flex-col">
                    {/* 上部 */}
                    <div className="flex justify-between items-center border-b p-6">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {year}年 {month}月
                            </h1>

                            <p className="text-gray-500 mt-1">
                                日別売上・宿泊人数・稼働率
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={route("analysis.index")}
                                className="bg-gray-600 text-white px-5 py-2 rounded"
                            >
                                戻る
                            </Link>

                            <a
                                href={route("analysis.export", {
                                    year,
                                    month,
                                })}
                                className="bg-green-600 text-white px-5 py-2 rounded"
                            >
                                CSV出力
                            </a>
                        </div>
                    </div>

                    {/* テーブル */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-slate-800 text-white">
                                <tr>
                                    <th className="px-4 py-3">
                                        日付
                                    </th>
                                    <th className="px-4 py-3">
                                        売上
                                    </th>
                                    <th className="px-4 py-3">
                                        宿泊人数
                                    </th>
                                    <th className="px-4 py-3">
                                        稼働率
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {dailyData.map((day) => (

                                    <tr
                                        key={day.date}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">

                                            {day.date}

                                        </td>
                                        <td className="px-4 py-3">

                                            ¥{Number(day.sales).toLocaleString()}

                                        </td>
                                        <td className="px-4 py-3">

                                            {day.guests}人

                                        </td>
                                        <td className="px-4 py-3">

                                            {day.occupancy_rate}%

                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}