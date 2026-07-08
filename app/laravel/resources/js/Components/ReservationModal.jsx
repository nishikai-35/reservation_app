export default function ReservationModal({
    reservation,
    onClose,
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

                <button
                    onClick={onClose}
                    className="mt-4 rounded bg-gray-500 px-4 py-2 text-white"
                >
                    閉じる
                </button>
            </div>
        </div>
    );
}