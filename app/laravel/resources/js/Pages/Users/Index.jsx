import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';


export default function Index({ auth, users }) {

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