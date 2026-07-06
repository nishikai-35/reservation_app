import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth }) {

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        room_number: '',
        capacity_min: 1,
        capacity_max: 4,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('rooms.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2>部屋登録</h2>}
        >
            <Head title="部屋登録" />

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

                            {errors.room_number && (
                                <div className="text-red-500">
                                    {errors.room_number}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label>最小人数</label>

                            <input
                                type="number"
                                className="w-full border"
                                value={data.capacity_min}
                                onChange={(e) =>
                                    setData('capacity_min', e.target.value)
                                }
                            />
                        </div>
                            
                        <div className="mb-4">
                            <label>最大人数</label>
                            
                            <input
                                type="number"
                                className="w-full border"
                                value={data.capacity_max}
                                onChange={(e) =>
                                    setData('capacity_max', e.target.value)
                                }
                            />
                        </div>
                            
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            登録
                        </button>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}