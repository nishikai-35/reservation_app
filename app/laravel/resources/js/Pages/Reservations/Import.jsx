import { useState, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";

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
        reservation_numbers: [],
    });

    const [fileName, setFileName] = useState("");
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [previewData,setPreviewData] = useState([]);
    const [previewLoading,setPreviewLoading] = useState(false);
    const [selectedReservations, setSelectedReservations] = useState([]);


    // プレビュー機能
    const preview = () => {

        if(!data.csv){
            alert('CSVを選択してください');
            return;
        }

        const formData = new FormData();
        formData.append(
            'csv',
            data.csv
        );

        setPreviewLoading(true);

        axios.post(
            route('reservations.import.preview'),
            formData,
            {
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            }
        )

        .then(response=>{

            const data = response.data.data;

            setPreviewData(data);

            const availableReservations = data 
                .filter(item => item.can_import !== false) 
                .map(item => item.reservation_number);

            setSelectedReservations(availableReservations);
        })

        .catch(error => { 
            console.error("プレビューエラー:", error);
            
            console.error('status:', error.response?.status);
            console.error('data:', error.response?.data);
            
            alert( 
                error.response?.data?.message 
                ?? "プレビュー処理に失敗しました。" 
            );
        })

        .finally(()=>{
            setPreviewLoading(false);
        });
    };

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


    // 予約選択切り替え
    const toggleReservation = (reservationNumber) => {
        setSelectedReservations((prev) => {
            if (
                prev.includes(
                    reservationNumber
                )
            ) {
                return prev.filter(
                    number => number !== reservationNumber
                )
            }

            return [...prev, reservationNumber];
        });
    };

    // 全選択
    const selectAllReservations = () => {
        const availableReservations = 
        previewData
            .filter(item => item.can_import !== false)
            .map(item => item.reservation_number);

        setSelectedReservations(availableReservations);
    };

    // 全解除
    const deselectAllReservations = () => {
        setSelectedReservations([]);
    };

    // インポートデータ登録
    const submit = (e) => {
        e.preventDefault();

        if (previewData.length === 0) {
            alert("プレビューを選択してください。");
            return;
        }

        if (selectedReservations.length === 0) {
            alert("インポートする予約を選択してください。");
            return;
        }

        // console.log(
        //     "登録直前 selectedReservations:",
        //     selectedReservations
        // );

        setData(
            "reservation_numbers",
            selectedReservations
        );

        // 選択した予約番号をlaravelへ送信
        post(
            route("reservations.import.store"),
            {
                forceFormData: true,

                transform: (data) => ({
                    ...data,
                    reservation_numbers: selectedReservations,
                }),

                onSuccess: () => {

                    // プレビュー表示をクリア
                    setPreviewData([]);

                    // 選択状態をクリア 
                    setSelectedReservations([]);

                    // 選択ファイルも解除
                    setFileName("");

                    // フォームデータもクリア
                    setData("csv", null);
                    setData("reservation_numbers", []);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="予約インポート" />
            <div
                className="min-h-screen bg-cover bg-center bg-fixed py-8"
                style={{backgroundImage: "url('/images/dashboard-bg.jpg')",}}
            >
                
                <div className="mx-auto max-w-7xl rounded-2xl bg-white/70 p-6 backdrop-blur-sm">

                    {/* タイトル */}
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                予約インポート
                            </h1>
                            <p className="mt-2 text-gray-500">
                                CSVファイルをインポートできます。
                            </p>
                        </div>
                    </div>

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

                                        // CSV変更時はプレビュー破棄
                                        setPreviewData([]);
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


                                {/* プレビュー確認ボタン */}
                                <button
                                    type="button"
                                    onClick={preview}
                                    disabled={previewLoading}
                                    className="
                                        mt-4
                                        mr-3
                                        bg-green-600
                                        hover:bg-green-700
                                        disabled:bg-gray-400
                                        text-white
                                        px-5
                                        py-2
                                        rounded
                                    "
                                >
                                    {previewLoading
                                        ? "解析中..."
                                        : "プレビュー確認"
                                    }
                                </button>

                                {/* プレビュー */}
                                {previewData.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="
                                            mb-4
                                            text-lg
                                            font-bold
                                        ">
                                            インポート内容確認
                                        </h2>
                                        {/* 全選択・全解除 */} 
                                        <div className="flex gap-2"> 
                                            <button 
                                                type="button" 
                                                onClick={ selectAllReservations } 
                                                className=" rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800 " 
                                            > 
                                            登録可能な予約を全選択 
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={ deselectAllReservations } 
                                                className=" rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800 " 
                                            > 
                                            全解除 
                                            </button>
                                        </div>
                                        {/* 選択件数 */}
                                        <div className="mb-3 text-sm text-gray-600">
                                            選択中：
                                            <span className="font-bold text-blue-600">
                                                {selectedReservations.length}
                                            </span>
                                            件/
                                            全 
                                            {previewData.length}
                                            件
                                        </div>
                                        <div className="
                                            overflow-x-auto
                                            border
                                            rounded-lg
                                        ">
                                            <table className="min-w-full text-sm">
                                                <thead
                                                    className="
                                                        bg-gray-100
                                                        border-b
                                                    "
                                                >
                                                    <tr>
                                                        <th className="px-4 py-3">
                                                            インポート可否
                                                        </th>
                                                        
                                                        <th className="px-4 py-3">
                                                            予約番号
                                                        </th>
                                
                                                        <th className="px-4 py-3">
                                                            予約者
                                                        </th>
                                
                                                        <th className="px-4 py-3">
                                                            チェックイン
                                                        </th>
                                
                                                        <th className="px-4 py-3">
                                                            チェックアウト
                                                        </th>
                                
                                                        <th className="px-4 py-3">
                                                            金額
                                                        </th>
                                
                                                        <th className="px-4 py-3">
                                                            予約サイト
                                                        </th>
                                                    </tr>
                                                </thead>
                                
                                                <tbody>
                                                    {previewData.map(
                                                        (item, index) => {
                                                            const canImport = item.can_import !== false;
                                                            const isSelected =
                                                                selectedReservations.includes(
                                                                    item.reservation_number
                                                                );
                                                            return (
                                                                <tr
                                                                    key={item.reservation_number ?? index}
                                                                    className={'border-b ${!canImport ? "bg-red-100" : ""}'}
                                                                >
                                                                    {/* インポート可否 */}
                                                                    <td className="px-4 py-3 text-center">

                                                                        {canImport ? (
                                                                        
                                                                            <div className="
                                                                                flex
                                                                                items-center
                                                                                justify-center
                                                                                gap-2
                                                                            ">
                                                                            
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={() =>
                                                                                        toggleReservation(
                                                                                            item.reservation_number
                                                                                        )
                                                                                    }
                                                                                    disabled={processing}
                                                                                    className="h-4 w-4 cursor-pointer rounded"
                                                                                />

                                                                                <span
                                                                                    className="whitespace-nowrap rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                                                                                >
                                                                                    取込可能
                                                                                </span>
                                                                            </div>

                                                                        ) : (
                                                                        
                                                                            <div className="flex flex-col items-center justify-center gap-2">
                                                                            
                                                                                {/* 登録不可バッジ */}
                                                                                <span
                                                                                    className="whitespace-nowrap rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                                                                                >
                                                                                    登録不可
                                                                                </span>
                                                                        
                                                                                {/* 登録不可理由 */}
                                                                                <span
                                                                                    className="
                                                                                        whitespace-nowrap
                                                                                        text-xs
                                                                                        text-red-600
                                                                                    "
                                                                                >
                                                                                    {item.import_error ?? "登録不可"}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                    </td>

                                                                    <td className="px-4 py-3 text-center">
                                                                        {item.reservation_number}
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-3 text-center">
                                                                        {item.guest_name}
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-3 text-center">
                                                                        {item.checkin_date}
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-3 text-center">
                                                                        {item.checkout_date}
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-3 text-center">
                                                                        {Number(
                                                                            item.amount
                                                                        ).toLocaleString()}円
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-3 text-center">
                                                                        {item.booking_site}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 進捗表示 */}
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

                            {/* インポート開始ボタン */}
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        previewData.length === 0
                                    }
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
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}