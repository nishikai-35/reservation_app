import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, room }) {

    const { data, setData, put, processing, errors } = useForm({
        name: room?.name ?? '',
        room_number: room?.room_number ?? '',
        capacity_min: room?.capacity_min ?? 1,
        capacity_max: room?.capacity_max ?? 4,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('rooms.update', room.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2>部屋編集</h2>}
        >
            <Head title="部屋編集" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto">

                    <form onSubmit={submit}>

                        <div className="mb-4">
                            <label>部屋名</label>

                            <input
                                type="text"
                                className="w-full border"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />

                            {errors.name && (
                                <div>{errors.name}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label>部屋番号</label>

                            <input
                                type="number"
                                className="w-full border"
                                value={data.room_number}
                                onChange={(e) =>
                                    setData('room_number', e.target.value)
                                }
                            />

                            {errors.room_number && <div>{errors.room_number}</div>}
                        </div>

                        <div className="mb-4">
                            <label>最小人数</label>
                            <input
                                type="number"
                                className="w-full border"
                                value={data.capacity_min}
                                onChange={(e) => setData('capacity_min', e.target.value)}
                            />

                            {errors.capacity_min && <div>{errors.capacity_min}</div>}
                        </div>

                        <div className="mb-4">
                            <label>最大人数</label>
                            <input
                                type="number"
                                className="w-full border"
                                value={data.capacity_max}
                                onChange={(e) => setData('capacity_max', e.target.value)}
                            />

                            {errors.capacity_max && <div>{errors.capacity_max}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            更新
                        </button>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}