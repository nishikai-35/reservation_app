import { Head, useForm } from '@inertiajs/react';

export default function SetPassword({ token }) {

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        token: token,
        password: '',
        password_confirmation: '',
    });


    const submit = (e) => {
        e.preventDefault();
        post(
            route(
                'password.setup.store'
            )
        );
    };


    return (
        <>
            <Head title="パスワード設定" />

            <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">

                <h1 className="text-2xl font-bold mb-4">
                    パスワード設定
                </h1>
                <form
                    onSubmit={submit}
                >
                    <div className="mb-4">
                        <label>
                            新しいパスワード
                        </label>

                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData(
                                    'password',
                                    e.target.value
                                )
                            }
                            className="w-full border rounded"
                        />
                        {errors.password && (
                            <div className="text-red-500">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label>
                            パスワード確認
                        </label>

                        <input
                            type="password"
                            value={
                                data.password_confirmation
                            }
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value
                                )
                            }
                            className="w-full border rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        設定する
                    </button>

                </form>
            </div>
        </>
    );
}