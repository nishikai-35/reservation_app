import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, room }) {

    const { data, setData, put, processing, errors } = useForm({
        name: room.name,
        room_number: room.room_number,
        capacity_min: room.capacity_min,
        capacity_max: room.capacity_max,
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
                                type="text"
                                className="w-full border"
                                value={data.room_number}
                                onChange={(e) =>
                                    setData('room_number', e.target.value)
                                }
                            />
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