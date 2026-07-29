import { useState, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Import({ auth }) {

    const { flash } = usePage().props;

    const {
        data,
        setData,
        post,
        processing,
        errors,
        progress
    } = useForm({
        csv: null,
    });

    const [fileName, setFileName] = useState("");
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);

    // Flashメッセージ表示
    useEffect(() => {
        if (flash?.success) {

            setMessage(flash.success);
            setMessageType("success");

        }

        if (flash?.error) {

            setMessage(flash.error);
            setMessageType("error");

        }

        if (flash?.success || flash?.error) {

            const timer = setTimeout(() => {

                setMessage(null);
                setMessageType(null);

            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();

        post(
            route("reservations.import.store"),
            {
                forceFormData: true,
            }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    予約インポート
                </h2>
            }
        >
            <Head title="CSVインポート" />
            <div className="py-8">
                <div className="mx-auto max-w-3xl">
                    <div className="bg-white shadow rounded-lg p-6">

                        {/* Flashメッセージ */}
                        {message && (
                            <div
                                className={`
                                    mb-6
                                    rounded-lg
                                    border
                                    px-4
                                    py-3
                                    text-sm
                                    ${
                                        messageType === "success"
                                            ? "border-green-200 bg-green-50 text-green-700"
                                            : "border-red-200 bg-red-50 text-red-700"
                                    }
                                `}
                            >
                                {messageType === "success"
                                    ? "✓ "
                                    : "× "
                                }
                                {message}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="mb-6">
                                <label className="block mb-2 text-lg font-medium">
                                    CSVファイルインポート
                                </label>

                                <p className="mt-1 mb-6 text-sm text-gray-600">
                                    楽天トラベル、Booking.com などの予約CSVを取り込みます。
                                </p>

                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {

                                        setData(
                                            "csv",
                                            e.target.files[0]
                                        );

                                        setFileName(
                                            e.target.files[0]?.name ?? ""
                                        );
                                    }}

                                    className="
                                        block
                                        w-full
                                        border
                                        rounded
                                        p-2
                                    "
                                />

                                {fileName && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        選択中：{fileName}
                                    </p>
                                )}

                                {errors.csv && (
                                    <div className="mt-2 text-red-600 text-sm">
                                        {errors.csv}
                                    </div>
                                )}
                            </div>

                            {progress && (
                                <div className="mb-4">
                                    <div className="w-full bg-gray-200 rounded">
                                        <div
                                            className="
                                                bg-blue-600
                                                text-xs
                                                text-white
                                                text-center
                                                rounded
                                            "
                                            style={{
                                                width: `${progress.percentage}%`,
                                            }}
                                        >
                                            {progress.percentage}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="
                                    bg-blue-600
                                    hover:bg-blue-700
                                    disabled:bg-gray-400
                                    text-white
                                    px-5
                                    py-2
                                    rounded
                                "
                            >
                                {processing
                                    ? "インポート中..."
                                    : "インポート開始"
                                }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}