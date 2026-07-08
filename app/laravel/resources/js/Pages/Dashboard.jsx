import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ReservationModal from '@/Components/ReservationModal';
import { useState } from 'react';

export default function Dashboard({
    auth,
    checkinReservations = [],
    checkoutReservations = [],
    stayingGuestCount = 0,
    today,
}) {
    const statusLabels = {
        1: '予約済み',
        2: 'チェックイン済み',
        3: '滞在中',
        4: '延泊中',
        5: 'チェックアウト済み',
        8: '保留',
        9: 'キャンセル',
    };

    // ステータス色分け
    const statusClasses = {
        1: 'bg-blue-100 text-blue-800',
        2: 'bg-green-100 text-green-800',
        3: 'bg-yellow-100 text-yellow-800',
        4: 'bg-orange-100 text-orange-800',
        5: 'bg-gray-100 text-gray-800',
        8: 'bg-purple-100 text-purple-800',
        9: 'bg-red-100 text-red-800',
    };

    // ステータス更新関数
    const updateStatus = (reservationId, status) => {
        router.patch(route('reservations.updateStatus', reservationId), {
            status,
        });
    };

    // 予約詳細モーダルの表示状態を管理
    const [selectedReservation, setSelectedReservation] = useState(null);

    // ダッシュボード表示
    const ReservationTable = ({ title, reservations, dateLabel, actionLabel, actionStatus, }) => (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    {title}
                </h3>

                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">予約番号</th>
                            <th className="border p-2">宿泊者名</th>
                            <th className="border p-2">部屋</th>
                            <th className="border p-2">人数</th>
                            <th className="border p-2">{dateLabel}</th>
                            <th className="border p-2">ステータス</th>
                            <th className="border p-2">操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reservations.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="border p-2 text-center"
                                >
                                    データがありません
                                </td>
                            </tr>
                        ) : (
                            // テーブル
                            reservations.map((reservation) => (
                                <tr 
                                    key={reservation.id}
                                    onClick={() => setSelectedReservation(reservation)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                        <td className="border p-2">
                                            {reservation.reservation_number}
                                        </td>
                                        <td className="border p-2">
                                            {reservation.guest_name}
                                        </td>
                                        <td className="border p-2">
                                            {reservation.room?.room_number} {reservation.room?.name}
                                        </td>
                                        <td className="border p-2">
                                            {reservation.guest_count}
                                        </td>
                                        <td className="border p-2">
                                            {dateLabel === 'チェックイン日'
                                                ? reservation.checkin_date
                                                : reservation.checkout_date}
                                        </td>

                                        {/* ステータス色分け */}
                                        <td className="border p-2">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-semibold ${
                                                    statusClasses[reservation.status]
                                                }`}
                                            >
                                                {statusLabels[reservation.status] ?? '不明'}
                                            </span>
                                        </td>
                                            
                                        {/* 操作 */}
                                        <td className="border p-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateStatus(reservation.id, actionStatus);
                                                }}
                                                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                            >
                                                {actionLabel}
                                            </button>
                                        </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ダッシュボード
                </h2>
            }
        >
            <Head title="ダッシュボード" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            対象日: {today}
                        </p>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="bg-white p-4 shadow-sm sm:rounded-lg">
                            <div className="text-sm text-gray-600">
                                本日のチェックイン
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                                {checkinReservations.length} 件
                            </div>
                        </div>

                        <div className="bg-white p-4 shadow-sm sm:rounded-lg">
                            <div className="text-sm text-gray-600">
                                本日のチェックアウト
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                                {checkoutReservations.length} 件
                            </div>
                        </div>

                        <div className="bg-white p-4 shadow-sm sm:rounded-lg">
                            <div className="text-sm text-gray-600">
                                滞在中人数
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                                {stayingGuestCount} 人
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ReservationTable
                            title="本日のチェックイン予定"
                            reservations={checkinReservations}
                            dateLabel="チェックイン日"
                            actionLabel="チェックイン済み"
                            actionStatus={2}
                        />

                        <ReservationTable
                            title="本日のチェックアウト予定"
                            reservations={checkoutReservations}
                            dateLabel="チェックアウト日"
                            actionLabel="チェックアウト済み"
                            actionStatus={5}
                        />

                        <ReservationModal
                            reservation={selectedReservation}
                            onClose={() => setSelectedReservation(null)}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}