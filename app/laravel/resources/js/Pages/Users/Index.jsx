import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, users, flash, filters }) {

    const handleDelete = (id) => {
        if (confirm('このユーザーを削除しますか？')) {
            router.delete(route('users.destroy', id));
        }
    };

    const [values, setValues] = useState({
        name: filters.name || '',
        email: filters.email || '',
    });

    const handleSearch = () => {
        router.get(route('users.index'), values, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClear = () => {
        setValues({
            name: '',
            email: '',
        });

        router.get(route('users.index'));
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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* フラッシュメッセージ */}
                    {flash?.success && (
                        <div className="rounded bg-green-100 text-green-700 p-3">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="rounded bg-red-100 text-red-700 p-3">
                            {flash.error}
                        </div>
                    )}

                    {/* ===========================
                        検索条件カード
                    ============================ */}
                    <div className="bg-white shadow rounded-lg">

                        <div className="border-b px-6 py-4">
                            <h3 className="text-lg font-semibold">
                                検索条件
                            </h3>
                        </div>

                        <div className="p-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        氏名
                                    </label>

                                    <input
                                        type="text"
                                        value={values.name}
                                        onChange={(e) =>
                                            setValues({
                                                ...values,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="氏名を入力"
                                        className="w-full rounded border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        メールアドレス
                                    </label>

                                    <input
                                        type="text"
                                        value={values.email}
                                        onChange={(e) =>
                                            setValues({
                                                ...values,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="メールアドレスを入力"
                                        className="w-full rounded border-gray-300"
                                    />
                                </div>

                            </div>

                            <div className="flex justify-end gap-3 mt-6">

                                <button
                                    onClick={handleClear}
                                    className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    クリア
                                </button>

                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    検索
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* ===========================
                        ユーザー一覧カード
                    ============================ */}
                    <div className="bg-white shadow rounded-lg">

                        <div className="border-b px-6 py-4 flex justify-between items-center">

                            <div>

                                <h3 className="text-lg font-semibold">
                                    ユーザー一覧
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    検索結果：{users.length}件
                                </p>

                            </div>

                            <Link
                                href={route('users.create')}
                                className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
                            >
                                新規登録
                            </Link>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead className="bg-gray-200">

                                    <tr>
                                        <th className="px-4 py-3 text-left">ID</th>
                                        <th className="px-4 py-3 text-left">氏名</th>
                                        <th className="px-4 py-3 text-left">メールアドレス</th>
                                        <th className="px-4 py-3 text-left">登録日</th>
                                        <th className="px-4 py-3 text-center">操作</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {users.length > 0 ? (

                                        users.map((user) => (

                                            <tr
                                                key={user.id}
                                                className="border-t hover:bg-gray-50"
                                            >

                                                <td className="px-4 py-3">
                                                    {user.id}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {user.name}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {user.email}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                                                </td>

                                                <td className="px-4 py-3">

                                                    <div className="flex justify-center gap-6">

                                                        <Link
                                                            href={route('users.edit', user.id)}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            編集
                                                        </Link>

                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-600 hover:underline"
                                                        >
                                                            削除
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="py-8 text-center text-gray-500"
                                            >
                                                該当するユーザーがありません。
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}