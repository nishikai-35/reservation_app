import { useForm } from '@inertiajs/react';

export default function EditReservationModal({
    reservation,
    refreshReservations,
    onClose,
}) {

    const { data, setData, put, processing } = useForm({
        room_id: reservation.room_id,
        checkin_date: reservation.checkin_date,
        checkout_date: reservation.checkout_date,
        guest_name: reservation.guest_name,
        guest_count: reservation.guest_count,
        phone: reservation.phone ?? '',
        note: reservation.note ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        put(
            route(
                'reservations.update',
                reservation.id
            ),
            {
                onSuccess: () => {
                    console.log('更新成功');
                    refreshReservations();
                    onClose();
                },

                onError: (errors) => {
                    console.log(errors);
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            <div className="w-full max-w-lg rounded bg-white p-6">

                <h2 className="mb-4 text-xl font-bold">
                    予約編集
                </h2>

                {/* 宿泊者名 */}
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

                {/* チェックイン日 */}
                <input
                    type="date"
                    value={data.checkin_date}
                    onChange={(e) =>
                        setData('checkin_date', e.target.value)
                    }
                />

                {/* チェックアウト日 */}
                <input
                    type="date"
                    value={data.checkout_date}
                    onChange={(e) =>
                        setData('checkout_date', e.target.value)
                    }
                />

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={submit}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        保存
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