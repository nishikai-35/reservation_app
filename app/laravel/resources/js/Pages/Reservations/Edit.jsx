import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, reservation, rooms = [] }) {

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

    // 日付データ管理
    const formatDate = (value) => {
        if (!value) {
            return '';
        }

        return value.substring(0, 10);
    };

    // 初期値
    const { data, setData, put, processing, errors } = useForm({
        room_id: reservation.room_id ?? '',
        checkin_date: formatDate(reservation.checkin_date),
        checkout_date: formatDate(reservation.checkout_date),
        guest_count: reservation.guest_count ?? 1,
        adult_count: reservation.adult_count ?? 1,
        child_count: reservation.child_count ?? 0,
        amount: reservation.amount ?? 0,
        payment_status: reservation.payment_status ?? 0,
        payment_method: reservation.payment_method ?? '',
        guest_name: reservation.guest_name ?? '',
        phone: reservation.phone ?? '',
        email: reservation.email ?? '',
        address: reservation.address ?? '',
        note: reservation.note ?? '',
        status: reservation.status ?? 1,
    });

    // 更新
    const submit = (e) => {
        e.preventDefault();

        put(route('reservations.update', reservation.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2>予約編集</h2>}
        >
            <Head title="予約編集" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <form onSubmit={submit} className="mb-6 border p-4 rounded bg-white">
                        <div className="mb-4">
                            <div className="text-sm text-gray-600">予約番号</div>
                            <div className="font-bold">{reservation.reservation_number}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm mb-1">部屋</label>
                                <select
                                    value={data.room_id}
                                    onChange={(e) => setData('room_id', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                >
                                    <option value="">選択してください</option>
                                    {rooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.room_number} {room.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.room_id && (
                                    <div className="text-red-600 text-sm">{errors.room_id}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm mb-1">宿泊者名</label>
                                <input
                                    type="text"
                                    value={data.guest_name}
                                    onChange={(e) => setData('guest_name', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.guest_name && (
                                    <div className="text-red-600 text-sm">{errors.guest_name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm mb-1">宿泊人数</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.guest_count}
                                    onChange={(e) => setData('guest_count', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.guest_count && (
                                    <div className="text-red-600 text-sm">{errors.guest_count}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm mb-1">チェックイン日</label>
                                <input
                                    type="date"
                                    value={data.checkin_date}
                                    onChange={(e) => setData('checkin_date', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.checkin_date && (
                                    <div className="text-red-600 text-sm">{errors.checkin_date}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm mb-1">チェックアウト日</label>
                                <input
                                    type="date"
                                    value={data.checkout_date}
                                    onChange={(e) => setData('checkout_date', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.checkout_date && (
                                    <div className="text-red-600 text-sm">{errors.checkout_date}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm mb-1">ステータス</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                >
                                    {Object.entries(statusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">大人人数</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.adult_count}
                                    onChange={(e) => setData('adult_count', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">子供人数</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.child_count}
                                    onChange={(e) => setData('child_count', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">料金</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">電話番号</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">メール</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.email && (
                                    <div className="text-red-600 text-sm">{errors.email}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm mb-1">決済方法</label>
                                <input
                                    type="text"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm mb-1">住所</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm mb-1">備考</label>
                                <textarea
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                更新
                            </button>

                            <Link
                                href={route('reservations.index')}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                戻る
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}