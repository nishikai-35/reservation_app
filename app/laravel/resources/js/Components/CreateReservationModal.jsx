import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function ReservationCreateModal({
    reservation = null,
    room = null,
    rooms = [],
    date = '',
    onClose,
    refreshReservations,
}) {

    // 初期値設定
    const {
        data,
        setData,
        post,
        processing,
        errors,
        put,
    } = useForm({

        room_id: room?.id ?? '',
        reservation_number: '',
        booking_site: '自社予約',
        reservation_date:
            new Date().toISOString().split('T')[0],

        guest_name: '',
        guest_count: 1,
        adult_count: 1,
        child_count: 0,
        checkin_date: date ?? '',
        checkout_date: date ?? '',
        phone: '',
        email: '',
        address: '',
        payment_method: '',
        payment_status: 0,
        amount: 0,
        note: '',
        status: 1,
    });

    useEffect(() => {
        if (room) {
            setData('room_id', room.id);
        }

        if (date) {
            setData('checkin_date', date);
            setData('checkout_date', date);
        }
    }, [
        room,
        date,
    ]);


    // 空室検索
    const [availableRooms, setAvailableRooms] = useState([]);

    const searchAvailableRooms = async () => {

        if (
            !data.checkin_date ||
            !data.checkout_date ||
            new Date(data.checkout_date) <= new Date(data.checkin_date)
        ) {
            setAvailableRooms([]);
            return;
        }

        const response = await fetch('/booking/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        .content,
            },
            body: JSON.stringify({
                checkin_date: data.checkin_date,
                checkout_date: data.checkout_date,
            }),
        });

        if (!response.ok) {
            setAvailableRooms([]);
            return;
        }

        const result = await response.json();
        setAvailableRooms(result.rooms ?? []);
    };

    useEffect(() => {
        searchAvailableRooms();
    }, [
        data.checkin_date,
        data.checkout_date,
    ]);

    useEffect(() => {

        if (room) return;

        if (
            data.room_id &&
            !availableRooms.some(
                room =>
                    Number(room.id) ===
                    Number(data.room_id)
            )

        ) {
            setData('room_id', '');
        }
        
    }, [
        availableRooms,
    ]);

    // 選択中の部屋取得
    const selectedRoom = useMemo(() => {
        if (room) {
            return room;
        }

        return (
            rooms.find(
                (r) =>
                    Number(r.id) === Number(data.room_id)
            ) ?? null
        );

    }, [
        room,
        rooms,
        data.room_id,
    ]);


    // 泊数計算
    const stayNights = useMemo(() => {

        if (
            !data.checkin_date ||
            !data.checkout_date
        ) {
            return 0;
        }

        const start = new Date(
            data.checkin_date
        );

        const end = new Date(
            data.checkout_date
        );

        return Math.max(
            0,
            Math.ceil(
                (end - start) /
                (1000 * 60 * 60 * 24)
            )
        );

    }, [
        data.checkin_date,
        data.checkout_date,
    ]);


    // 合計料金
    const totalPrice = useMemo(() => {

        if (!selectedRoom) {
            return 0;
        }

        return (
            (Number(data.adult_count) * Number(selectedRoom.adult_price))
            +
            (Number(data.child_count) * Number(selectedRoom.child_price))
        ) * stayNights;

    },[
        stayNights,
        selectedRoom,
        data.adult_count,
        data.child_count,
    ]);

    // 合計料金フォームに反映
    useEffect(() => {
        setData('amount', totalPrice);
    }, [
        totalPrice,
        setData,
    ]);


    // 宿泊人数計算
    useEffect(() => {
        setData(
            'guest_count',
            Number(data.adult_count) + Number(data.child_count)
        );
    },[
        data.adult_count,
        data.child_count,
        setData,
    ]);


    // 登録処理
    const submit = (e) => {
        e.preventDefault();

        if (reservation) {
            put(route('reservations.update', reservation.id), {
                onSuccess: () => {
                    refreshReservations();
                    onClose();
                },
            });
        } else {
            post(route('reservations.store'), {
                onSuccess: () => {
                    refreshReservations();
                    onClose();
                },
            });
        }
    };


    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* ヘッダー */}
                <div className="flex items-center justify-between bg-gray-800 px-8 py-5 text-white">
                    <div>
                        <h2 className="text-2xl font-bold">
                            予約新規登録
                        </h2>
                        <p className="mt-1 text-sm text-gray-300">
                            新しい予約を登録します。
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-3xl hover:text-gray-300"
                    >
                        ×
                     </button>
                </div>
    
                {/* フォーム */}
                <form
                    id="reservation-form"
                    onSubmit={submit}
                    className="flex-1 overflow-y-auto bg-gray-50 p-6"
                >
                    {/* 基本情報 */}
                    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                        <div className="bg-gray-700 px-6 py-3 text-lg font-semibold text-white">
                            基本情報
                        </div>
    
                        <div className="grid grid-cols-4 gap-6 p-6">
                            {/* 予約番号 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    予約番号
                                </label>
                                <input
                                    type="text"
                                    value="自動採番"
                                    disabled
                                    className="w-full rounded-lg border bg-gray-100 px-4 py-3"
                                />
                            </div>
    
                            {/* 宿泊者名 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    宿泊者名
                                </label>
                                <input
                                    type="text"
                                    value={data.guest_name}
                                    onChange={(e) =>
                                        setData(
                                            'guest_name',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                />
                                {errors.guest_name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guest_name}
                                    </p>
                                )}
                            </div>
                            
                            {/* 予約サイト */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    予約サイト
                                </label>
                                <select
                                    value={data.booking_site}
                                    onChange={(e) =>
                                        setData(
                                            'booking_site',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                >
                                    <option value="自社予約">
                                        自社予約
                                    </option>
                                    <option value="楽天トラベル">
                                        楽天トラベル
                                    </option>
                                    <option value="じゃらん">
                                        じゃらん
                                    </option>
                                    <option value="Booking.com">
                                        Booking.com
                                    </option>
                                    <option value="Agoda">
                                        Agoda
                                    </option>
                                </select>
                            </div>
                                
                            {/* 予約日 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    予約日
                                </label>
                                <input
                                    type="date"
                                    value={data.reservation_date}
                                    onChange={(e) =>
                                        setData(
                                            'reservation_date',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                />
                                {errors.reservation_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.reservation_date}
                                    </p>
                                )}
                            </div>
                            
                            {/* チェックイン */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    チェックイン
                                </label>
                                <input
                                    type="date"
                                    value={data.checkin_date}
                                    onChange={(e) =>
                                        setData(
                                            'checkin_date',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                />
                                {errors.checkin_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.checkin_date}
                                    </p>
                                )}
                            </div>
                            
                            {/* チェックアウト */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    チェックアウト
                                </label>
                                <input
                                    type="date"
                                    value={data.checkout_date}
                                    onChange={(e) =>
                                        setData(
                                            'checkout_date',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                />
                                {errors.checkout_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.checkout_date}
                                    </p>
                                )}
                            </div>
                            
                            {/* 部屋 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    部屋
                                </label>
                                {room ? (
                                    <input
                                        type="text"
                                        value={room.name}
                                        disabled
                                        className="w-full rounded-lg border bg-gray-100 px-4 py-3"
                                    />
                                ) : (
                                    <select
                                        value={data.room_id}
                                        onChange={(e) =>
                                            setData('room_id', e.target.value)
                                        }
                                        disabled={
                                            !data.checkin_date ||
                                            !data.checkout_date
                                        }
                                        className={`w-full rounded-lg border px-4 py-3 ${
                                            !data.checkin_date || !data.checkout_date
                                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                : ''
                                        }`}
                                    >
                                        <option value="">
                                            {!data.checkin_date || !data.checkout_date
                                                ? '先にチェックイン・アウト日を選択'
                                                : '部屋を選択してください'}
                                        </option>
                                            
                                        {availableRooms.map((roomItem) => (
                                            <option
                                                key={roomItem.id}
                                                value={roomItem.id}
                                            >
                                                {roomItem.room_number} {roomItem.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.room_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.room_id}
                                    </p>
                                )}
                            </div>
                            
                            {/* 宿泊人数 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    宿泊人数
                                </label>
                            
                                <input
                                    type="number"
                                    value={data.guest_count}
                                    disabled
                                    className="w-full rounded-lg border bg-gray-100 px-4 py-3"
                                />

                                {errors.guest_count && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guest_count}
                                    </p>
                                )}
                            </div>
                            
                            {/* 大人人数 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    大人人数
                                </label>
                            
                                <input
                                    type="number"
                                    min="1"
                                    value={data.adult_count}
                                    onChange={(e) =>
                                        setData(
                                            'adult_count',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                />

                                {errors.adult_count && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.adult_count}
                                    </p>
                                )}
                            </div>
                            
                            {/* 子ども人数 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    子ども人数
                                </label>
                            
                                <input
                                    type="number"
                                    min="0"
                                    value={data.child_count}
                                    onChange={(e) =>
                                        setData(
                                            'child_count',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                />

                                {errors.child_count && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.child_count}
                                    </p>
                                )}
                            </div>
                            
                            {/* 決済方法 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    決済方法
                                </label>
                            
                                <select
                                    value={data.payment_method}
                                    onChange={(e) =>
                                        setData(
                                            'payment_method',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                >
                                    <option value="">
                                        選択してください
                                    </option>
                                    <option value="現金">
                                        現金
                                    </option>
                                    <option value="クレジットカード">
                                        クレジットカード
                                    </option>
                                    <option value="銀行振込">
                                        銀行振込
                                    </option>
                                </select>
                                
                                {errors.payment_method && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.payment_method}
                                    </p>
                                )}
                            </div>
                            
                            {/* 決済状況 */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    決済状況
                                </label>
                            
                                <select
                                    value={data.payment_status}
                                    onChange={(e)=>
                                        setData(
                                            'payment_status',
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3"
                                >
                                    <option value={0}>
                                        未決済
                                    </option>
                                
                                    <option value={1}>
                                        決済済
                                    </option>
                                </select>
                                
                                {errors.payment_status && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.payment_status}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                            
                            
                    <div className="mt-6 grid grid-cols-12 gap-6">
                            
                        {/* 連絡先 */}
                        <div className="col-span-9 overflow-hidden rounded-xl border bg-white shadow-sm">
                            <div className="bg-gray-700 px-6 py-3 text-lg font-semibold text-white">
                                連絡先
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 p-6">
                                {/* 電話番号 */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        電話番号
                                    </label>
                            
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        className="w-full rounded-lg border px-4 py-3"
                                    />

                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                                
                                {/* メール */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        メールアドレス
                                    </label>
                                
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="w-full rounded-lg border px-4 py-3"
                                    />

                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                
                                {/* 住所 */}
                                <div className="col-span-2">
                                    <label className="mb-2 block text-sm font-semibold">
                                        住所
                                    </label>
                                
                                    <textarea
                                        rows="3"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        className="w-full rounded-lg border px-4 py-3"
                                    />

                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                                
                        {/* 金額合計 */}
                        <div className="col-span-3 overflow-hidden rounded-xl border bg-white shadow-sm">
                                
                            <div className="bg-blue-600 px-6 py-3 text-lg font-semibold text-white">
                                合計
                            </div>
                                
                            <div className="space-y-6 p-6">
                                
                                {/* 泊数 */}
                                <div>
                                    <div className="text-sm text-gray-500">
                                        泊数
                                    </div>
                                
                                    <div className="mt-2 text-3xl font-bold text-blue-600">
                                        {stayNights} 泊
                                    </div>
                                </div>
                                
                                {/* 合計料金 */}
                                <div>
                                    <div className="text-sm text-gray-500">
                                        合計料金
                                    </div>
                                
                                    <div className="mt-2 text-3xl font-bold text-green-600">
                                        ¥{Number(totalPrice).toLocaleString()}
                                    </div>
                                </div>
                                
                                {/* 金額調整 */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        金額調整
                                    </label>
                                
                                    <input
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData(
                                                "amount",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border px-4 py-3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                                    
                                    
                    {/* 備考 */}
                    <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
                        <div className="bg-gray-700 px-6 py-3 text-lg font-semibold text-white">
                            備考
                        </div>
                        <div className="p-6">
                            <textarea
                                rows="5"
                                value={data.note}
                                onChange={(e) =>
                                    setData(
                                        'note',
                                        e.target.value
                                    )
                                }
                                placeholder="備考を入力してください"
                                className="w-full rounded-lg border px-4 py-3"
                            />

                            {errors.note && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.note}
                                </p>
                            )}
                        </div>
                    </div>
                </form>
                        
                {/* フッター */}
                <div className="sticky bottom-0 flex items-center justify-between border-t bg-white px-8 py-5">
                    {/* 左側 */}
                    <div className="text-sm text-gray-500">
                        {selectedRoom ? (
                            <>
                                部屋：
                                <span className="font-semibold">
                                    {selectedRoom.room_number}
                                </span>
                                {' / '}
                                {selectedRoom.name}
                            </>
                        ) : (
                            <>
                                部屋を選択してください
                            </>
                        )}
                    </div>
                    
                    {/* 右側 */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            form="reservation-form"
                            disabled={
                                processing ||
                                !data.room_id ||
                                !data.checkin_date ||
                                !data.checkout_date
                            }
                            className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? '登録中...'
                                : '予約登録'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );  
}   
    