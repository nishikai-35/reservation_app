import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateReservationModal from '@/Components/CreateReservationModal';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, reservations, rooms = [] }) {
    
    // ステータス定義
    const statusLabels = {
        1: '予約済み',
        2: 'チェックイン済み',
        3: '滞在中',
        4: '延泊中',
        5: 'チェックアウト済み',
        8: '保留',
        9: 'キャンセル',
    };


    // 日付表示用
    const formatDateTime = (date) => {
        if (!date) return '';

        return new Date(date).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };


    // 予約データ未取得の場合の対策
    const reservationList = reservations?.data ?? [];

    // 検索条件
    const [search, setSearch] = useState({
        reservation_number: '',
        guest_name: '',
        room_id: '',
        status: '',
        from_date: '',
        to_date: '',
    });


    // 検索処理
    const handleSearchChange = (e) => {
        setSearch({
            ...search,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('reservations.index'),
            search,
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearSearch = () => {
        setSearch({
            reservation_number: '',
            guest_name: '',
            room_id: '',
            status: '',
            from_date: '',
            to_date: '',
        });

        router.get(route('reservations.index'));
    };


    // 削除
    const deleteReservation = (id) => {
        if (!confirm('削除してもよろしいですか？')) {
            return;
        }

        router.delete(route('reservations.destroy', id));
    };


    // モーダル表示の管理状態
    const [showCreateModal, setShowCreateModal] = useState(false);


    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="予約管理" />
            <div
                className="min-h-screen bg-cover bg-center bg-fixed py-8"
                style={{backgroundImage: "url('/images/dashboard-bg.jpg')",}}
            >
                <div className="mx-auto max-w-7xl rounded-2xl bg-white/70 p-6 backdrop-blur-sm">

                    {/* タイトル */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            予約管理
                        </h1>

                        <p className="mt-2 text-gray-500">
                            予約情報の検索・確認・編集を行います。
                        </p>
                    </div>

                    <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold">
                            検索条件
                        </h2>

                        <form
                            onSubmit={handleSearch}
                            className="grid grid-cols-6 gap-4"
                        >
                            {/* 予約番号 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    予約番号
                                </label>

                                <input
                                    type="text"
                                    name="reservation_number"
                                    value={search.reservation_number}
                                    onChange={handleSearchChange}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            {/* 宿泊者名 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    宿泊者名
                                </label>
                                <input
                                    type="text"
                                    name="guest_name"
                                    value={search.guest_name}
                                    onChange={handleSearchChange}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            {/* 部屋 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    部屋
                                </label>

                                <select
                                    name="room_id"
                                    value={search.room_id}
                                    onChange={handleSearchChange}
                                    className="w-full rounded-lg border px-3 py-2"
                                >
                                    <option value="">
                                        全て
                                    </option>

                                    {rooms.map((room) => (
                                        <option
                                            key={room.id}
                                            value={room.id}
                                        >
                                            {room.room_number} {room.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                                
                            {/* ステータス */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    ステータス
                                </label>
                                
                                <select
                                    name="status"
                                    value={search.status}
                                    onChange={handleSearchChange}
                                    className="w-full rounded-lg border px-3 py-2"
                                >
                                    <option value="">
                                        全て
                                    </option>
                                
                                    {Object.entries(statusLabels).map(([value, label]) => (
                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                                
                            {/* 期間 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    期間
                                </label>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        name="from_date"
                                        value={search.from_date}
                                        onChange={handleSearchChange}
                                        className="w-full rounded-lg border px-3 py-2"
                                    />

                                    <span>～</span>

                                    <input
                                        type="date"
                                        name="to_date"
                                        value={search.to_date}
                                        onChange={handleSearchChange}
                                        className="w-full rounded-lg border px-3 py-2"
                                    />
                                </div>
                            </div>
                                
                            {/* ボタン */}
                            <div className="col-span-6 mt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="rounded-lg border px-6 py-2 hover:bg-gray-100"
                                >
                                    クリア
                                </button>
                                
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    検索
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* 一覧カード */}
                    <div className="flex flex-col rounded-xl border bg-white shadow-sm h-[620px]">
                        <div className="flex items-center justify-between border-b p-5">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    予約一覧
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    検索結果：
                                    {reservationList.length}
                                    件
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
                            >
                                新規登録
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto">
                                <table className="min-w-full border-collapse">
                                    <thead className="sticky top-0 bg-gray-50 z-10">
                                        <tr>
                                            <th className="border-b p-3 text-left">
                                                ステータス
                                            </th>

                                            <th className="border-b p-3 text-left">
                                                予約番号
                                            </th>

                                            <th className="border-b p-3 text-left">
                                                宿泊者名
                                            </th>

                                            <th className="border-b p-3 text-left">
                                                部屋
                                            </th>

                                            <th className="border-b p-3 text-left">
                                                チェックイン
                                            </th>

                                            <th className="border-b p-3 text-left">
                                                チェックアウト
                                            </th>

                                            <th className="border-b p-3 text-center">
                                                人数
                                            </th>

                                            <th className="border-b p-3 text-left">
                                                電話番号
                                            </th>

                                            <th className="border-b p-3 text-center">
                                                操作
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {reservationList.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="p-8 text-center text-gray-500"
                                                >
                                                    該当する予約はありません。
                                                </td>
                                            </tr>
                                        ) : (
                                            reservationList.map((reservation) => (
                                                <tr
                                                    key={reservation.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    {/* ステータス */}
                                                    <td className="border-b p-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold
                                                                ${
                                                                    reservation.status == 1
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : reservation.status == 2
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : reservation.status == 3
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : reservation.status == 4
                                                                        ? 'bg-orange-100 text-orange-700'
                                                                        : reservation.status == 5
                                                                        ? 'bg-gray-200 text-gray-700'
                                                                        : reservation.status == 8
                                                                        ? 'bg-purple-100 text-purple-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                }
                                                            `}
                                                        >
                                                            {statusLabels[reservation.status]}
                                                        </span>
                                                    </td>
                                                            
                                                    {/* 予約番号 */}
                                                    <td className="border-b p-3">
                                                        {reservation.reservation_number}
                                                    </td>
                                                            
                                                    {/* 宿泊者名 */}
                                                    <td className="border-b p-3">
                                                        {reservation.guest_name}
                                                    </td>
                                                            
                                                    {/* 部屋 */}
                                                    <td className="border-b p-3">
                                                        {reservation.room?.room_number}
                                                        <br />
                                                        <span className="text-sm text-gray-500">
                                                            {reservation.room?.name}
                                                        </span>
                                                    </td>

                                                    {/* チェックイン */}
                                                    <td className="border-b p-3 whitespace-nowrap">
                                                        {formatDateTime(reservation.checkin_date)}
                                                    </td>

                                                    {/* チェックアウト */}
                                                    <td className="border-b p-3 whitespace-nowrap">
                                                        {formatDateTime(reservation.checkout_date)}
                                                    </td>
                                                            
                                                    {/* 人数 */}
                                                    <td className="border-b p-3 text-center">
                                                        {reservation.guest_count}名
                                                    </td>
                                                            
                                                    {/* 電話番号 */}
                                                    <td className="border-b p-3">
                                                        {reservation.phone}
                                                    </td>
                                                            
                                                    {/* 操作 */}
                                                    <td className="w-48 border-b p-3">
                                                        <div className="flex justify-center gap-2">
                                                            <Link
                                                                href={route(
                                                                    'reservations.edit',
                                                                    reservation.id
                                                                )}
                                                                className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                                                            >
                                                                編集
                                                            </Link>
                                                            
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteReservation(
                                                                        reservation.id
                                                                    )
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
                            </div>
                        </div>
                    </div>
                                
                    {/* ページネーション */}
                    {reservations.links && (
                        <div className="mt-6 flex justify-center gap-2">
                        
                            {reservations.links.map((link, index) => (
                            
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`rounded border px-3 py-2 text-sm
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

                    {/* モーダル表示 */}
                    {showCreateModal && (
                        <CreateReservationModal
                            room={null}
                            rooms={rooms}
                            date={null}
                            refreshReservations={() => router.reload()}
                            onClose={() => setShowCreateModal(false)}
                        />
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
