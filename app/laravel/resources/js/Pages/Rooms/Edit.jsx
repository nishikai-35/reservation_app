import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, room }) {

    const { data, setData, post, processing, errors } = useForm({
        name: room?.name ?? '',
        room_number: room?.room_number ?? '',
        capacity_min: room?.capacity_min ?? '',
        capacity_max: room?.capacity_max ?? '',
        adult_price: room?.adult_price ?? '',
        child_price: room?.child_price ?? '',
        checkin_time: room?.checkin_time ?? '15:00',
        checkout_time: room?.checkout_time ?? '10:00',
        note: room?.note ?? '',
        image: null,
        _method: 'put',
    });


    const submit = (e) => {
        e.preventDefault();
    
        console.log(route('rooms.update', room.id));
        console.log(data);
    
        post(route('rooms.update', room.id), {
            forceFormData: true,
        });
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-2xl font-bold">
                        部屋マスター 部屋編集
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        部屋情報を編集します。
                    </p>
                </div>
            }
        >
            <Head title="部屋登録"/>

            <div className="py-8 bg-gray-50 min-h-screen px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={submit}>

                        {/* 基本情報カード */}
                        <div className="bg-white rounded-xl border shadow-sm mb-6">
                            <div className="px-6 py-4 border-b">
                                <h3 className="font-bold text-lg">
                                    基本情報
                                </h3>

                                <p className="text-sm text-gray-500">
                                    部屋の名称や人数設定、宿泊時間を入力してください。
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label>
                                            部屋名
                                            <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-1 rounded">
                                                必須
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.name}
                                            onChange={(e)=>setData('name',e.target.value)}
                                        />

                                        {errors.name &&
                                            <div className="text-red-500">
                                                {errors.name}
                                            </div>
                                        }

                                    </div>
                                    
                                    <div className="mb-4">
                                        <label>
                                            部屋番号
                                            <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-1 rounded">
                                                必須
                                            </span>
                                        </label>
                                    
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.room_number}
                                            onChange={(e)=>setData('room_number',e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label>
                                            最小人数
                                        </label>
                                    
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.capacity_min}
                                            onChange={(e)=>setData('capacity_min',e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label>
                                            最大人数
                                            <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-1 rounded">
                                                必須
                                            </span>
                                        </label>
                                    
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.capacity_max}
                                            onChange={(e)=>setData('capacity_max',e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label>
                                            チェックイン時間
                                        </label>
                                    
                                        <input
                                            type="time"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.checkin_time}
                                            onChange={(e)=>setData('checkin_time',e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label>
                                            チェックアウト時間
                                        </label>
                                    
                                        <input
                                            type="time"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.checkout_time}
                                            onChange={(e)=>setData('checkout_time',e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 部屋画像アップロード */}
                        <div className="bg-white rounded-xl border shadow-sm mb-6">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-xl font-bold">
                                    部屋画像
                                </h2>

                                <div className="mt-5">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e)=>
                                            setData(
                                                'image',
                                                e.target.files[0]
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            {room.image && (
                                <div className="mt-6 mb-5 px-6">
                                    <img
                                        src={`/storage/${room.image}`}
                                        alt={room.name}
                                        className="h-48 w-72 rounded-xl border object-cover"
                                    />
                                </div>
                            )}
                        </div>

                                    
                        {/* 料金カード */}
                        <div className="bg-white rounded-xl border shadow-sm mb-6">
                            <div className="px-6 py-4 border-b">
                                <h3 className="font-bold text-lg">
                                    料金設定
                                </h3>
                                    
                                <p className="text-sm text-gray-500">
                                    1泊あたりの料金を設定してください。
                                </p>
                            </div>
                                    
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label>
                                            大人料金（1泊）
                                            <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-1 rounded">
                                                必須
                                            </span>
                                        </label>
                                    
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.adult_price}
                                            onChange={(e)=>setData('adult_price',e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label>
                                            子供料金（1泊）
                                            <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-1 rounded">
                                                必須
                                            </span>
                                        </label>
                                    
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={data.child_price}
                                            onChange={(e)=>setData('child_price',e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                                    
                        {/* 備考カード */}
                        <div className="bg-white rounded-xl border shadow-sm mb-6">
                            <div className="px-6 py-4 border-b">
                                <h3 className="font-bold text-lg">
                                    備考
                                </h3>
                                    
                                <p className="text-sm text-gray-500">
                                    補足情報があれば入力してください。
                                </p>
                            </div>
                                    
                            <div className="p-6">
                                <textarea
                                    rows="4"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={data.note}
                                    onChange={(e)=>setData('note',e.target.value)}
                                />
                            </div>
                        </div>
                                    
                        {/* 登録・キャンセルボタン */}
                        <div className="flex justify-end gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="w-32 bg-gray-500 hover:bg-gray-700 text-white px-8 py-2 rounded-lg"
                            >
                                戻る
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-32 bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg"
                            >
                                更新
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
