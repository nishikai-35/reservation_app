import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, rooms }) {

    const deleteRoom = (id) => {
        if (!confirm('削除してもよろしいですか？')) {
            return;
        }

        router.delete(
            route('rooms.destroy', id)
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2>部屋マスター</h2>}
        >
            <Head title="部屋マスター" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4">

                    <div className="mb-4">
                        <Link
                            href={route('rooms.create')}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            新規登録
                        </Link>
                    </div>

                    <table className="min-w-full border">
                        <thead>
                            <tr>
                                <th className="border p-2">部屋番号</th>
                                <th className="border p-2">部屋名</th>
                                <th className="border p-2">最小人数</th>
                                <th className="border p-2">最大人数</th>
                                <th className="border p-2">操作</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rooms.data.map((room) => (
                                <tr key={room.id}>
                                    <td className="border p-2">
                                        {room.room_number}
                                    </td>

                                    <td className="border p-2">
                                        {room.name}
                                    </td>

                                    <td className="border p-2">
                                        {room.capacity_min}
                                    </td>

                                    <td className="border p-2">
                                        {room.capacity_max}
                                    </td>

                                    <td className="border p-2">
                                        <Link
                                            href={route('rooms.edit', room.id)}
                                            className="text-blue-600"
                                        >
                                            編集
                                        </Link>

                                        <button
                                            onClick={() => deleteRoom(room.id)}
                                            className="text-red-600"
                                        >
                                            削除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}