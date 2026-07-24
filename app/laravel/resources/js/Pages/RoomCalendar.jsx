import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ReservationModal from '@/Components/ReservationModal';
import CreateReservationModal from '@/Components/CreateReservationModal';
import EditReservationModal from '@/Components/EditReservationModal';

export default function RoomCalendar({
    auth,
    rooms = [],
    reservations = [],
}) {
    // 表示開始日
    const [startDate, setStartDate] = useState(new Date());

    // 日付生成
    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + index);
            return date.toISOString().split('T')[0];
        });
    }, [startDate]);

    // 週切替
    const changeWeek = (days) => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + days);
        setStartDate(newDate);
    };

    // 今日へ戻る
    const goToday = () => {
        setStartDate(new Date());
    };

    // 日付表示
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 曜日表示
    const getWeekday = (dateString) => {
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

        return weekdays[new Date(dateString).getDay()];
    };

    // ステータス色
    const statusColors = {
        1: 'bg-blue-200',
        2: 'bg-green-200',
        3: 'bg-yellow-200',
        4: 'bg-orange-200',
        5: 'bg-gray-200',
        8: 'bg-purple-200',
        9: 'bg-red-200',
    };

    // ステータス名
    const statusLabels = {
        1: '予約済み',
        2: 'チェックイン済み',
        3: '滞在中',
        4: '延泊中',
        5: 'チェックアウト済み',
        8: '保留',
        9: 'キャンセル',
    };

    // 予約検索
    const findReservation = (roomId, date) => {
        return reservations.find((reservation) => {
            return (
                reservation.room_id === roomId &&
                date >= reservation.checkin_date &&
                date < reservation.checkout_date
            );
        });
    };

    // モーダル管理
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [editingReservation, setEditingReservation] = useState(null);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const openCreateModal = (room, date) => {
        setSelectedRoom(room);
        setSelectedDate(date);
    };

    // 再取得
    const refreshReservations = () => {
        router.get(
            route('room.calendar'),
            {
                start_date: dates[0],
                end_date: dates[6],
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    部屋状況
                </h2>
            }
        >
            <Head title="部屋状況" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-6">

                    {/* タイトル */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            部屋状況
                        </h1>
                        <p className="mt-2 text-gray-500">
                            部屋ごとの予約状況を週表示・月表示で確認できます。
                        </p>
                    </div>

                    {/* 表示期間カード */}
                    <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">

                            {/* 左 */}
                            <div>
                                <div className="text-sm text-gray-500">
                                    表示期間
                                </div>

                                <div className="mt-2 text-3xl font-bold">
                                    {formatDate(dates[0])} ～ {formatDate(dates[6])}
                                </div>
                            </div>

                            {/* 中央 */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => changeWeek(-7)}
                                    className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                                >
                                    前へ
                                </button>

                                <button
                                    onClick={goToday}
                                    className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                                >
                                    今日へ戻る
                                </button>

                                <button
                                    onClick={() => changeWeek(7)}
                                    className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                                >
                                    次へ
                                </button>

                            </div>

                            {/* 右 */}
                            <div className="flex gap-2">

                                <button className="rounded-lg bg-black px-5 py-2 text-white">
                                    週表示
                                </button>

                                <button className="rounded-lg border px-5 py-2">
                                    月表示
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* カレンダーカード */}
                    <div className="rounded-2xl border bg-white shadow-sm">

                        <div className="border-b p-5">

                            <h2 className="text-xl font-semibold">
                                予約状況（{formatDate(dates[0])} ～ {formatDate(dates[6])}）
                            </h2>

                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-56 border-b border-r p-4 text-left text-lg font-semibold">
                                            部屋
                                        </th>

                                        {dates.map((date) => {
                                            const day = new Date(date).getDay();
                                            return (
                                                <th
                                                    key={date}
                                                    className={`min-w-[120px] border-b border-r p-4 text-center
                                                        ${day === 0 ? 'bg-red-50' : ''}
                                                        ${day === 6 ? 'bg-blue-50' : ''}
                                                    `}
                                                >

                                                    <div className="font-semibold">
                                                        {formatDate(date)}
                                                    </div>

                                                    <div className="mt-2 text-sm text-gray-500">
                                                        {getWeekday(date)}
                                                    </div>

                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {rooms.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={dates.length + 1}
                                                className="p-8 text-center text-gray-500"
                                            >
                                                部屋データがありません
                                            </td>
                                        </tr>
                                    ) : (
                                        rooms.map((room) => (
                                            <tr
                                                key={room.id}
                                                className="hover:bg-gray-50"
                                            >
                                                {/* 部屋情報 */}
                                                <td className="border-r border-b p-4 align-top">

                                                    <div className="flex items-start justify-between">

                                                        <div>

                                                            <div className="text-xl font-semibold">
                                                                {room.room_number}
                                                            </div>

                                                            <div className="mt-1 text-gray-500">
                                                                {room.name}
                                                            </div>

                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                openCreateModal(
                                                                    room,
                                                                    dates[0]
                                                                )
                                                            }
                                                            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
                                                        >
                                                            ＋
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* 日付セル */}
                                                {dates.map((date) => (
                                                    <td
                                                        key={`${room.id}-${date}`}
                                                        className="h-24 border-r border-b cursor-pointer hover:bg-gray-100"
                                                        onClick={() => {
                                                            const reservation =
                                                                findReservation(
                                                                    room.id,
                                                                    date
                                                                );

                                                            if (!reservation) {
                                                                openCreateModal(
                                                                    room,
                                                                    date
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {(() => {
                                                            const reservation =
                                                                findReservation(
                                                                    room.id,
                                                                    date
                                                                );

                                                            if (!reservation) {
                                                                return null;
                                                            }

                                                            return (
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();

                                                                        setSelectedReservation(
                                                                            reservation
                                                                        );
                                                                    }}
                                                                    className={`mx-1 rounded-lg p-2 text-xs font-medium transition hover:opacity-80 ${statusColors[reservation.status]}`}
                                                                >
                                                                    <div className="truncate">
                                                                        {
                                                                            reservation.guest_name
                                                                        }
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ステータス凡例 */}
                    <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold">
                            ステータス凡例
                        </h2>

                        <div className="flex flex-wrap gap-3">
                            {Object.entries(statusLabels).map(
                                ([status, label]) => (
                                    <span
                                        key={status}
                                        className={`rounded-full px-4 py-2 text-sm font-medium ${statusColors[status]}`}
                                    >
                                        {label}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 新規予約モーダル */}
            {selectedRoom && (
                <CreateReservationModal
                    room={selectedRoom}
                    rooms={rooms}
                    date={selectedDate}
                    refreshReservations={refreshReservations}
                    onClose={() => {
                        setSelectedRoom(null);
                        setSelectedDate(null);
                    }}
                />
            )}
            {/* 予約詳細モーダル */}
            {selectedReservation && (
                <ReservationModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onEdit={(reservation) => {
                        setSelectedReservation(null);
                        setEditingReservation(reservation);
                    }}
                />
            )}
            {/* 予約編集モーダル */}
            {editingReservation && (
                <EditReservationModal
                    reservation={editingReservation}
                    refreshReservations={refreshReservations}
                    onClose={() =>
                        setEditingReservation(null)
                    }
                />
            )}
        </AuthenticatedLayout>
    );
}