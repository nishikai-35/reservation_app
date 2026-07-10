import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ReservationModal from '@/Components/ReservationModal';
import CreateReservationModal from '@/Components/CreateReservationModal';
import EditReservationModal from '@/Components/EditReservationModal';

export default function RoomCalendar({
    auth,
    rooms = [],
    reservations = [],
}) {
    // とりあえず7日分表示(dates 定義)
    const dates = [
        '2026-07-08',
        '2026-07-09',
        '2026-07-10',
        '2026-07-11',
        '2026-07-12',
        '2026-07-13',
        '2026-07-14',
    ];

    // ステータス色分け
    const statusColors = {
        1: 'bg-blue-200',
        2: 'bg-green-200',
        3: 'bg-yellow-200',
        4: 'bg-orange-200',
        5: 'bg-gray-200',
        8: 'bg-purple-200',
        9: 'bg-red-200',
    };

    // 予約検索関数　定義
    const findReservation = (roomId, date) => {
        return reservations.find((reservation) => {
            return (
                reservation.room_id === roomId &&
                date >= reservation.checkin_date &&
                date < reservation.checkout_date
            );
        });
    };

    // 予約情報保持
    const [selectedReservation, setSelectedReservation] = useState(null);

    // 編集用State
    const [editingReservation, setEditingReservation] = useState(null);

    // 空室クリック時のモーダル表示状態を管理
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    // 空室クリック時のモーダル表示関数
    const openCreateModal = (room, date) => {
        setSelectedRoom(room);
        setSelectedDate(date);
        setShowCreateModal(true);
    };

    // 予約情報　再取得
    const refreshReservations = () => {
        router.reload({
            only: [
                'reservations'
            ]
        });

    };

    
    // 表示
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    部屋状況カレンダー
                </h2>
            }
        >
            <Head title="部屋状況カレンダー" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="overflow-x-auto rounded-lg bg-white shadow">
                        <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3">
                                        部屋
                                    </th>

                                    {dates.map((date) => (
                                        <th
                                            key={date}
                                            className="border p-3 text-center"
                                        >
                                            {date}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {rooms.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={dates.length + 1}
                                            className="border p-4 text-center"
                                        >
                                            部屋データがありません
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.map((room) => (
                                        <tr key={room.id}>
                                            <td className="border p-3 font-medium">
                                                {room.room_number}
                                                <br />
                                                {room.name}
                                            </td>

                                            {dates.map((date) => (
                                                <td
                                                    key={`${room.id}-${date}`}
                                                    className="h-16 border cursor-pointer hover:bg-gray-100"
                                                    onClick={() => {
                                                        const reservation = findReservation(room.id, date);
                                                    
                                                        // 空室の場合のみ新規予約モーダル
                                                        if (!reservation) {
                                                            openCreateModal(room, date);
                                                        }
                                                    }}
                                                >
                                                    {(() => {
                                                        const reservation = findReservation(room.id, date);
                                                    
                                                        // 空室
                                                        if (!reservation) {
                                                            return null;
                                                        }
                                                    
                                                        // 予約あり
                                                        return (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedReservation(reservation);
                                                                }}
                                                                className={`cursor-pointer rounded p-1 text-xs transition hover:opacity-80 ${
                                                                    statusColors[reservation.status]
                                                                }`}
                                                            >
                                                                {reservation.guest_name}
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
            </div>

            {/* カレンダー */}

            {/* 新規予約モーダル */}
            {selectedRoom && (
                <CreateReservationModal
                    room={selectedRoom}
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
                    onClose={() => setEditingReservation(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}