import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';


export default function Index({ auth, users, flash }) {

    const handleDelete = (id) => {
        if (
            confirm('このユーザーを削除しますか？')
        ) {

            router.delete(
                route('users.destroy', id)
            );
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    ユーザー管理
                </h2>
            }
        >
            <Head title="ユーザー管理" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">

                            <div className="mb-4">
                                <Link
                                    href={route('users.create')}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    ユーザー追加
                                </Link>
                            </div>

                            {/* 編集完了後のフラッシュメッセージ */}
                            {flash?.success && (
                                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                                    {flash.success}
                                </div>
                            )}

                            <table className="min-w-full border">
                                <thead>
                                    <tr>
                                        <th className="border p-2">
                                            ID
                                        </th>
                                        <th className="border p-2">
                                            名前
                                        </th>
                                        <th className="border p-2">
                                            メールアドレス
                                        </th>
                                        <th className="border p-2">
                                            登録日
                                        </th>
                                        <th className="border p-2">
                                            操作
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="border p-2">
                                                {user.id}
                                            </td>

                                            <td className="border p-2">
                                                {user.name}
                                            </td>
                                            
                                            <td className="border p-2">
                                                {user.email}
                                            </td>
                                            
                                            <td className="border p-2">
                                                {user.created_at}
                                            </td>
                                            
                                            <td className="border p-2">
                                                <Link
                                                    href={route('users.edit', user.id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    編集
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-500"
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}