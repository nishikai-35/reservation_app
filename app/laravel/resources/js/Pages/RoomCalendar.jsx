import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateReservationModal from '@/Components/CreateReservationModal';
import EditReservationModal from '@/Components/EditReservationModal';
import ReservationBar from '@/Components/Calendar/ReservationBar';


import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function RoomCalendar({
    auth,
    rooms = [],
    reservations = [],
}) {
    // 表示開始日
    const today = new Date();
    today.setDate(
        today.getDate() - today.getDay()
    );

    const [startDate,setStartDate]=useState(today);
    

    // 表示モード
    const [viewMode, setViewMode] = useState('week');

    // 日付生成
    const dates = useMemo(() => {

        if (viewMode === 'week') {
            return Array.from({ length: 7 }, (_, i) => {

                const date = new Date(startDate);
                date.setDate(date.getDate() + i);

                return date.toISOString().split('T')[0];
            });
        }

        // 月表示
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: lastDay }, (_, i) => {

            const date = new Date(year, month, i + 1);
            return date.toISOString().split('T')[0];
        });
    }, [startDate, viewMode]);


    // 週・月切替
    const changePeriod = (direction) => {

        const newDate = new Date(startDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + direction * 7);
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }

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

    // 宿泊者表示セル幅
    const ROOM_WIDTH = 200;

    const CELL_WIDTH =
    viewMode === 'week'
        ? 154   // 週表示
        : 60;   // 月表示
    
    const getReservationWidth = (reservation) => {

        const checkin = new Date(reservation.checkin_date.substring(0,10));
        const checkout = new Date(reservation.checkout_date.substring(0,10));
        const viewStart = new Date(dates[0]);
        const viewEnd = new Date(dates[dates.length - 1]);

        const start =
            checkin < viewStart
                ? viewStart
                : checkin;

        const end =
            checkout > viewEnd
                ? viewEnd
                : checkout;

        const diff =
            (end - start) / (1000 * 60 * 60 * 24);

        const nights =
            diff <= 0
                ? 1
                : Math.ceil(diff);
        
        return nights * CELL_WIDTH;
    };

    const getReservationLeft = (reservation) => {

        const checkin = new Date(
            reservation.checkin_date.substring(0,10)
        );

        const viewStart = new Date(dates[0]);

        if(checkin <= viewStart){
            return 0;
        }

        const diff = Math.floor(
            (checkin - viewStart) /
            (1000*60*60*24)
        );

        return diff * CELL_WIDTH;
    };


    // モーダル管理
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const openCreateModal = (room, date) => {
        setSelectedReservation(null);
        setSelectedRoom(room);
        setSelectedDate(date);
        setShowReservationModal(true);
    };

    const closeModal = () => {
        setShowReservationModal(false);
        setSelectedRoom(null);
        setSelectedDate(null);
        setSelectedReservation(null);
    };


    // 再取得
    const refreshReservations = () => {
        router.get(
            route('room-calendar.index'),
            {
                start_date: dates[0],
                end_date: dates[dates.length - 1],
                view: viewMode,
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
        >
            <Head title="部屋状況" />
            <div 
                className="min-h-screen bg-cover bg-center bg-fixed py-8"
                style={{backgroundImage: "url('/images/dashboard-bg.jpg')",}}
            >
                <div className="mx-auto max-w-7xl rounded-2xl bg-white/70 p-6 backdrop-blur-sm">

                    {/* タイトル */}
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold">
                            部屋状況
                        </h1>
                        <p className="text-xs text-gray-500">
                            部屋ごとの予約状況を週表示・月表示で確認できます。
                        </p>
                    </div>

                    {/* 表示期間カード */}
                    <div className="mb-4 rounded-2xl border bg-white px-5 py-3 shadow-sm">
                        <div className="flex items-center justify-between">

                            {/* 左 */}
                            <div>
                                <div className="text-sm text-gray-500">
                                    表示期間
                                </div>

                                <div className="mt-2 text-3xl font-bold">
                                    {formatDate(dates[0])} ～ {formatDate(dates[dates.length - 1])}
                                </div>
                            </div>

                            {/* 中央 */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => changePeriod(-1)}
                                    className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                                >
                                    前へ
                                </button>

                                <button
                                    onClick={goToday}
                                    className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                                >
                                    今日へ戻る
                                </button>

                                <button
                                    onClick={() => changePeriod(1)}
                                    className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                                >
                                    次へ
                                </button>
                            </div>

                            {/* 右 */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`rounded-lg px-4 py-2 ${
                                        viewMode === 'week'
                                            ? 'bg-black text-white'
                                            : 'border hover:bg-gray-100'
                                    }`}
                                >
                                    週表示
                                </button>

                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`rounded-lg px-4 py-2 ${
                                        viewMode === 'month'
                                            ? 'bg-black text-white'
                                            : 'border hover:bg-gray-100'
                                    }`}
                                >
                                    月表示
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* カレンダーカード */}
                    <div className="flex flex-col flex-1 rounded-2xl border bg-white shadow-sm overflow-visible">

                        <div className="border-b p-5">
                            <h2 className="text-lg font-semibold">
                                予約状況（{formatDate(dates[0])} ～ {formatDate(dates[dates.length - 1])}）
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <div
                                className="min-w-full"
                                style={{
                                    width: Math.max(
                                        ROOM_WIDTH + dates.length * CELL_WIDTH,
                                        1200
                                    ),
                                }}
                            >

                                {/* 日付ヘッダー */}
                                <div className="flex">
                                    <div 
                                        className="shrink-0 border-b border-r p-4 font-semibold"
                                        style={{width: 200, minWidth: 200, maxWidth: 200,}}
                                    >
                                        部屋
                                    </div>

                                    {dates.map(date => (
                                        <div 
                                            key={date} 
                                            style={{width: CELL_WIDTH, minWidth: CELL_WIDTH, maxWidth: CELL_WIDTH,}}
                                            className="border-b border-r p-2 text-center shrink-0"
                                        >
                                            <div>{formatDate(date)}</div>
                                            <div className="text-xs text-gray-500">{getWeekday(date)}</div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* 部屋行 */}
                                {rooms.map(room => (
                                    <div key={room.id} className="flex border-b">
                                
                                        {/* 部屋情報 */}
                                        <div
                                            className="shrink-0 border-r p-4 relative"
                                            style={{width: 200, minWidth: 200, maxWidth: 200,}}
                                        >
                                            <div className="font-semibold">
                                                {room.room_number}
                                            </div>
                                
                                            <div className="text-xs text-gray-500">
                                                {room.name}
                                            </div>
                                
                                            <button
                                                onClick={()=>openCreateModal(room,dates[0])}
                                                className="absolute right-3 top-3 border rounded px-2"
                                            >
                                                ＋
                                            </button>
                                        </div>
                                
                                        {/* タイムライン */}
                                        <div
                                            className="relative h-24 overflow-hidden shrink-0"
                                            style={{
                                                width: dates.length * CELL_WIDTH,
                                                minWidth: dates.length * CELL_WIDTH,
                                                maxWidth: dates.length * CELL_WIDTH,
                                            }}
                                        >
                                        
                                            {/* 日付線 */}
                                            {dates.map((date,index)=>(
                                                <div
                                                    key={date}
                                                    className="absolute top-0 bottom-0 border-r"
                                                    style={{left:index * CELL_WIDTH}}
                                                />
                                            ))}
                                        
                                            {/* 予約バー */}
                                            {reservations
                                                .filter(reservation=>{
                                                    if(reservation.room_id !== room.id) return false;

                                                    const checkin = reservation.checkin_date.substring(0,10);
                                                    const checkout = reservation.checkout_date.substring(0,10);
                                                    const viewStart = dates[0];
                                                    const viewEnd = dates[dates.length - 1];

                                                    return (
                                                        checkin <= viewEnd &&
                                                        checkout > viewStart
                                                    );
                                                })

                                                .map(reservation=>(
                                                    <ReservationBar
                                                        key={reservation.id}
                                                        reservation={reservation}
                                                        left={getReservationLeft(reservation)}
                                                        width={getReservationWidth(reservation)}
                                                        color={statusColors[reservation.status]}
                                                        onClick={()=>{
                                                            setSelectedReservation(reservation);
                                                            setSelectedRoom(room);
                                                            setSelectedDate(reservation.checkin_date);
                                                            setShowReservationModal(true);
                                                        }}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* ステータス凡例 */}
                    <div className="mt-4 rounded-2xl border bg-white px-5 py-3 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold">
                            ステータス凡例
                        </h2>

                        <div className="flex flex-wrap gap-3">
                            {Object.entries(statusLabels).map(
                                ([status, label]) => (
                                    <span
                                        key={status}
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[status]}`}
                                    >
                                        {label}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 予約編集モーダル */}
            {showReservationModal && (
                selectedReservation ? (
                    <EditReservationModal
                        reservation={selectedReservation}
                        rooms={rooms}
                        refreshReservations={refreshReservations}
                        onClose={closeModal}
                    />
                ) : (
                    <CreateReservationModal
                        room={selectedRoom}
                        rooms={rooms}
                        date={selectedDate}
                        refreshReservations={refreshReservations}
                        onClose={closeModal}
                    />
                )
            )}
        </AuthenticatedLayout>
    );
}