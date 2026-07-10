import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function CreateReservationModal({
    room,
    date,
    onClose,
}) {
    // 予約項目
    const { data, setData, post, processing } = useForm({
        room_id: room?.id ?? '',
        checkin_date: date ?? '',
        checkout_date: date ?? '',
        guest_name: '',
        guest_count: 1,
        phone: '',
        email: '',
        address: '',
        note: '',
        status: 1, // 新規予約のステータスを初期値として設定
    });


    useEffect(() => {
        if (room) {
            setData('room_id', room.id);
        }

        if (date) {
            setData('checkin_date', date);
        }
    }, [room, date]);

    // roomがない場合は表示しない
    if (!room) return null;

    // フォーム送信
    const submit = (e) => {
        e.preventDefault();


        post(route('reservations.store'), {
            onSuccess: () => {
                console.log('登録成功');
            },
        
            onError: (errors) => {
                console.log(errors);
            },
        });
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded bg-white p-6">

                <h2 className="mb-4 text-xl font-bold">
                    新規予約
                </h2>

                <p>部屋: {room.name}</p>
                <p>チェックイン日: {date}</p>

                {/* 宿泊者名入力 */}
                <div className="mt-4">
                    <label className="block mb-1">
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
                        className="w-full rounded border px-3 py-2"
                    />
                </div>

                {/* 宿泊人数入力 */}
                <div className="mt-4">
                    <label className="block mb-1 font-semibold">
                        宿泊人数
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={data.guest_count}
                        onChange={(e) =>
                            setData(
                                'guest_count',
                                e.target.value
                            )
                        }
                        className="w-full rounded border px-3 py-2"
                    />
                </div>

                <div className="mt-4">
                    <label className="block mb-1">
                        チェックアウト日
                    </label>

                    <input
                        type="date"
                        value={data.checkout_date}
                        onChange={(e) =>
                            setData('checkout_date', e.target.value)
                        }
                        className="w-full rounded border px-3 py-2"
                    />
                </div>

                <div className="mt-4">
                    <label className="block mb-1 font-semibold">
                        電話番号
                    </label>

                    <input
                        type="text"
                        value={data.phone}
                        onChange={(e) =>
                            setData(
                                'phone',
                                e.target.value
                            )
                        }
                        className="w-full rounded border px-3 py-2"
                    />
                </div>

                <div className="mt-4">
                    <label className="block mb-1 font-semibold">
                        備考
                    </label>

                    <textarea
                        value={data.note}
                        onChange={(e) =>
                            setData(
                                'note',
                                e.target.value
                            )
                        }
                        className="w-full rounded border px-3 py-2"
                    />
                </div>


                <div className="mt-4 flex gap-2">

                    <button
                        onClick={submit}
                        disabled={processing}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        {processing ? '登録中...' : '登録'}
                    </button>

                    <button
                        onClick={onClose}
                        className="rounded bg-gray-500 px-4 py-2 text-white"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}