import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth }) {

    const {
        data,
        setData,
        post,
        processing,
        errors
    } = useForm({
        name: '',
        email: '',
    });


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

            <div className="p-6">
                <form
                    onSubmit={submit}
                    className="bg-white p-6 rounded shadow"
                >

                    {/* 名前 */}
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block mb-1"
                        >
                            名前
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) =>
                                setData(
                                    'name',
                                    e.target.value
                                )
                            }
                            className="w-full border rounded p-2"
                        />

                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </p>
                        )}

                    </div>


                    {/* メール */}
                    <div className="mb-4">

                        <label
                            htmlFor="email"
                            className="block mb-1"
                        >
                            メールアドレス
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) =>
                                setData(
                                    'email',
                                    e.target.value
                                )
                            }
                            className="w-full border rounded p-2"
                        />

                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>


                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {processing
                            ? '登録中...'
                            : '登録'
                        }
                    </button>
                </form>
                
            </div>
        </AuthenticatedLayout>
    );
}