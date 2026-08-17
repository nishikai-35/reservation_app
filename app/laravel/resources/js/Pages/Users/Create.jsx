import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth }) {

    // フォーム入力値、送信状態管理
    const {
        data,
        setData,
        post,
        processing,
        errors
    } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
    });


    // 登録
    const submit = (e) => {
        e.preventDefault();

        console.log('submit実行');
        console.log(data);

        post(route('users.store'), {
            onSuccess: () => {
                console.log('ユーザー登録成功');
            },

            onError: (errors) => {
                console.log('Validation Error');
                console.log(errors);
            },
        });
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    ユーザー登録
                </h2>
            }
        >
            <Head title="ユーザー登録" />

            <div className="py-8 bg-gray-50 min-h-screen px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-xl border shadow-sm">

                        {/* カードヘッダー */}
                        <div className="px-6 py-4 border-b">
                            <h3 className="font-bold text-lg">
                                ユーザー情報
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                ユーザー情報を入力してください。
                            </p>
                        </div>

                        <form
                            onSubmit={submit}
                            className="p-6"
                        >

                            {/* 名前 */}
                            <div className="mb-5">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    名前
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e)=>
                                        setData(
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* メール */}
                            <div className="mb-5">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    メールアドレス
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e)=>
                                        setData(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* パスワード */}
                            <div className="mb-5">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    パスワード
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e)=>
                                        setData(
                                            'password',
                                            e.target.value
                                        )
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* 権限 */}
                            <div className="mb-5">
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    権限
                                </label>
                                
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        setData('role', e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">選択してください</option>
                                    <option value="user">一般ユーザー</option>
                                    <option value="admin">管理者</option>
                                </select>
                                
                                {errors.role && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* ボタン */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="w-32 bg-red-500 hover:bg-red-700 text-white px-8 py-2 rounded-lg"
                                >
                                    キャンセル
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-32 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
                                >
                                    {processing
                                        ? '登録中...'
                                        : '登録'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}