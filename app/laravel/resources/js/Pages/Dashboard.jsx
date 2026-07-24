import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import ReservationModal from '@/Components/ReservationModal';
import { useState } from 'react';


export default function Dashboard({
    auth,
    today,
    totalRooms,
    todayCheckinCount,
    todayCheckoutCount,
    stayingCount,
    checkinReservations = [],
    checkoutReservations = [],
    stayingReservation = [],
    
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


    const { auth: pageAuth } = usePage().props;

    // role情報確認用
    console.log(pageAuth);


    // 予約テーブル表示
    const ReservationTable = ({
        title,
        reservations,
        dateLabel,
        actionLabel,
        actionStatus,
    }) => (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

            {/* カードタイトル */}
            <div className="border-b bg-gray-50 px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900">
                    {title}
                </h3>
            </div>

            {/* テーブル */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                予約番号
                            </th>

                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                宿泊者名
                            </th>

                            <th className="px-4 py-3 text-left text-sm font-semibold">
                                部屋
                            </th>

                            <th className="px-4 py-3 text-center text-sm font-semibold">
                                人数
                            </th>

                            <th className="px-4 py-3 text-center text-sm font-semibold">
                                {dateLabel}
                            </th>

                            <th className="px-4 py-3 text-center text-sm font-semibold">
                                ステータス
                            </th>

                            <th className="px-4 py-3 text-center text-sm font-semibold">
                                操作
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {reservations.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="py-12 text-center text-gray-500"
                                >
                                    {title}はありません。
                                </td>
                            </tr>
                        ) : (
                            reservations.map((reservation) => (
                                <tr
                                    key={reservation.id}
                                    onClick={() =>
                                        setSelectedReservation(
                                            reservation
                                        )
                                    }
                                    className="cursor-pointer border-t transition hover:bg-gray-50"
                                >

                                    {/* 予約番号 */}
                                    <td className="px-4 py-4">
                                        {reservation.reservation_number}
                                    </td>

                                    {/* 宿泊者 */}
                                    <td className="px-4 py-4 font-medium">
                                        {reservation.guest_name}
                                    </td>

                                    {/* 部屋 */}
                                    <td className="px-4 py-4">
                                        {reservation.room?.room_number}
                                        <br />

                                        <span className="text-sm text-gray-500">
                                            {reservation.room?.name}
                                        </span>
                                    </td>

                                    {/* 人数 */}
                                    <td className="px-4 py-4 text-center">
                                        {reservation.guest_count}名
                                    </td>

                                    {/* 日付 */}
                                    <td className="px-4 py-4 text-center">
                                        {dateLabel === 'チェックイン日'
                                            ? reservation.checkin_date
                                            : reservation.checkout_date}
                                    </td>

                                    {/* ステータス */}
                                    <td className="px-4 py-4 text-center">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                statusClasses[
                                                    reservation.status
                                                ]
                                            }`}
                                        >
                                            {statusLabels[
                                                reservation.status
                                            ]}
                                        </span>
                                    </td>

                                    {/* 操作 */}
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={(e) => {

                                                e.stopPropagation();

                                                updateStatus(
                                                    reservation.id,
                                                    actionStatus
                                                );

                                            }}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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

                    {/* タイトル */}
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-8 flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    ダッシュボード
                                </h1>

                                <p className="mt-2 text-gray-500">
                                    本日の宿泊状況を確認できます。
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    router.visit(route('reservations.index'))
                                }
                                className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-black"
                            >
                                新規登録
                            </button>
                        </div>
                            
                        {/* KPIカード */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="text-lg font-semibold text-gray-700">
                                    総部屋数
                                </div>

                                <div className="mt-4 text-5xl font-bold text-gray-900">
                                    5
                                </div>

                                <div className="mt-2 text-sm text-gray-500">
                                    登録済みの部屋数
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="text-lg font-semibold text-gray-700">
                                    本日チェックイン
                                </div>

                                <div className="mt-4 text-5xl font-bold text-blue-600">
                                    {checkinReservations.length}
                                </div>

                                <div className="mt-2 text-sm text-gray-500">
                                    本日の到着予定
                                </div>
                            </div>
                    
                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="text-lg font-semibold text-gray-700">
                                    本日チェックアウト
                                </div>

                                <div className="mt-4 text-5xl font-bold text-red-500">
                                    {checkoutReservations.length}
                                </div>

                                <div className="mt-2 text-sm text-gray-500">
                                    本日の出発予定
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="text-lg font-semibold text-gray-700">
                                    本日宿泊中
                                </div>

                                <div className="mt-4 text-5xl font-bold text-green-600">
                                    {stayingCount}
                                </div>

                                <div className="mt-2 text-sm text-gray-500">
                                    現在滞在中の人数
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6">
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