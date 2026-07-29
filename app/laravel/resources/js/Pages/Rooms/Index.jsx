import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, rooms }) {

    const deleteRoom = (id) => {
        if (!confirm('削除してもよろしいですか？')) {
            return;
        }

        router.delete(
            route('rooms.destroy', id)
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            // header={<h2>部屋マスター</h2>}
        >
            <Head title="部屋マスター" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-6">

                    {/* タイトル */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            部屋マスター
                        </h1>

                        <p className="mt-2 text-gray-500">
                            部屋情報の一覧です。
                        </p>
                    </div>

                    {/* 一覧カード */}
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                        {/* カードヘッダー */}
                        <div className="flex items-center justify-between border-b px-6 py-5">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    部屋一覧
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    登録されている部屋情報を確認・編集できます。
                                </p>
                            </div>

                            <Link
                                href={route('rooms.create')}
                                className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
                            >
                                新規登録
                            </Link>
                        </div>

                        {/* テーブルエリア */}
                        <div className="overflow-x-auto">
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>

                                            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                                                部屋名
                                            </th>

                                            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                                                部屋番号
                                            </th>

                                            <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                                宿泊人数
                                            </th>

                                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                                                大人料金
                                            </th>

                                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                                                こども料金
                                            </th>

                                            <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                                チェックイン
                                            </th>

                                            <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                                チェックアウト
                                            </th>

                                            <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                                                操作
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {rooms.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="py-10 text-center text-gray-500"
                                                >
                                                    部屋情報がありません。
                                                </td>
                                            </tr>
                                        ) : (
                                            rooms.data.map((room) => (
                                                <tr
                                                    key={room.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                
                                                    {/* 部屋名 */}
                                                    <td className="px-5 py-4">
                                                        {room.name}
                                                    </td>
                                            
                                                    {/* 部屋番号 */}
                                                    <td className="px-5 py-4">
                                                        {room.room_number}
                                                    </td>
                                            
                                                    {/* 宿泊人数 */}
                                                    <td className="px-5 py-4 text-center">
                                                        {room.capacity_min}〜{room.capacity_max}
                                                    </td>
                                            
                                                    {/* 大人料金 */}
                                                    <td className="px-5 py-4 text-right">
                                                        {Number(room.adult_price).toLocaleString()}円
                                                    </td>
                                            
                                                    {/* 子ども料金 */}
                                                    <td className="px-5 py-4 text-right">
                                                        {Number(room.child_price).toLocaleString()}円
                                                    </td>
                                            
                                                    {/* チェックイン */}
                                                    <td className="px-5 py-4 text-center">
                                                        {room.checkin_time}
                                                    </td>
                                            
                                                    {/* チェックアウト */}
                                                    <td className="px-5 py-4 text-center">
                                                        {room.checkout_time}
                                                    </td>
                                            
                                                    {/* 操作 */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-center gap-3">
                                                            <Link
                                                                href={route(
                                                                    'rooms.edit',
                                                                    room.id
                                                                )}
                                                                className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                                                            >
                                                                編集
                                                            </Link>
                                                            
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteRoom(room.id)
                                                                }
                                                                className="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                                            >
                                                                削除
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* データなし */}
                                {rooms.data.length === 0 && (
                                    <div className="border-t bg-white py-12 text-center text-gray-500">
                                        部屋データはありません。
                                    </div>
                                )}
                            </div>

                            {/* ページネーション */}
                            {rooms.links && (
                                <div className="mt-6 flex justify-center gap-2">
                                
                                    {rooms.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url ?? '#'}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                            className={`
                                                rounded-lg border px-4 py-2 text-sm transition
                                                ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white hover:bg-gray-100'
                                                }
                                                ${
                                                    !link.url
                                                        ? 'pointer-events-none opacity-50'
                                                        : ''
                                                }
                                            `}
                                        />
                                    ))}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
