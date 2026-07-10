import { router } from '@inertiajs/react';

export default function ReservationModal({
    reservation,
    onClose,
    onEdit,
    onSuccess,
}) {
    if (!reservation) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded bg-white p-6">
                <h2 className="mb-4 text-xl font-bold">
                    予約詳細
                </h2>

                <p>予約番号: {reservation.reservation_number}</p>
                <p>宿泊者名: {reservation.guest_name}</p>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => onEdit(reservation)}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        編集
                    </button>

                    <button
                        onClick={onClose}
                        className="rounded bg-gray-500 px-4 py-2 text-white"
                    >
                        閉じる
                    </button>

                    <button
                        onClick={() => {
                            if (!confirm('予約をキャンセルしますか？')) {
                                return;
                            }
                        
                            router.patch(
                                route(
                                    'reservations.updateStatus',
                                    reservation.id
                                ),
                                {
                                    status: 9,
                                },
                                {
                                    onSuccess: () => {
                                        console.log('キャンセル成功');
                                        onClose();
                                    },
                                }
                            );
                        }}
                        className="rounded bg-red-600 px-4 py-2 text-white"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
}