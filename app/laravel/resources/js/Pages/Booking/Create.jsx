import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';


export default function Create({
    auth,
    rooms = [],
    search = {},
    }) {

    const [price, setPrice] = useState(null);
    const [days, setDays] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        room_id: '',
        checkin_date: '',
        checkout_date: '',
        adult_count: 1,
        child_count: 0,
        guest_name: '',
        email: '',
        phone: '',
        note: '',
        status: 1,
    });


    // 料金自動計算
    const calculatePrice = async () => {
        const response = await fetch(
            '/booking/calculate',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                    'X-CSRF-TOKEN':
                        document
                        .querySelector(
                            'meta[name="csrf-token"]'
                        )
                        .content,
                },

                body: JSON.stringify({
                    room_id: data.room_id,
                    checkin_date: data.checkin_date,
                    checkout_date: data.checkout_date,
                    adult_count: data.adult_count,
                    child_count: data.child_count,
                }),
            }
        );
        const result = await response.json();
        setPrice(result.price);
        setDays(result.days);
    };

    useEffect(()=>{
        if(
            !data.room_id ||
            !data.checkin_date ||
            !data.checkout_date
        ){
        setPrice(null);
        setDays(1);

        return;
        }
        calculatePrice();
    },[
        data.room_id,
        data.checkin_date,
        data.checkout_date,
        data.adult_count,
        data.child_count,
    ]);


    // 空室検索
    const [availableRooms, setAvailableRooms] = useState([]);

    const searchAvailableRooms = async () => {
        if (!data.checkin_date || !data.checkout_date) {
            setAvailableRooms([]);
            return;
        }

        const response = await fetch('/booking/search', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        .content,
            },

            body: JSON.stringify({
                checkin_date:data.checkin_date,
                checkout_date:data.checkout_date,
            })
        });
        const result = await response.json();
        setAvailableRooms(result.rooms);
    };

    // 自動空室検索
    useEffect(() => {
        searchAvailableRooms();
    }, [
        data.checkin_date,
        data.checkout_date
    ]);


    // 予約登録
    const submit = (e) => {
        e.preventDefault();
        post(route('booking.store'));
    };


    return (
        <>
            <Head title="宿泊予約" />

            <div className="min-h-screen bg-gray-100 py-10">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

                        {/* タイトル */}
                        <div className="border-b px-8 py-8">
                            <h1 className="text-4xl font-bold text-sky-900">
                                ご予約フォーム
                            </h1>

                            <p className="mt-2 text-gray-500">
                                宿泊日の選択・宿泊人数・代表者情報をご入力ください。
                            </p>
                        </div>

                        <div className="p-8">
                            <form
                                onSubmit={submit}
                                className="space-y-8"
                            >
                                {/* チェックイン・チェックアウト */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block font-semibold text-sky-900">
                                            チェックイン日
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <input
                                            type="date"
                                            value={data.checkin_date}
                                            onChange={(e) =>
                                                setData("checkin_date", e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                                        />

                                        {errors.checkin_date && (
                                            <p className="mt-2 text-sm text-red-500">
                                                {errors.checkin_date}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="mb-2 block font-semibold text-sky-900">
                                            チェックアウト日
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>
                                    
                                        <input
                                            type="date"
                                            value={data.checkout_date}
                                            onChange={(e) =>
                                                setData("checkout_date", e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                                        />
                                    </div>
                                </div>

                                {/* 部屋 */}
                                <div>
                                    <label className="mb-2 block font-semibold text-sky-900">
                                        部屋
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <select
                                        value={data.room_id}
                                        onChange={(e) =>
                                            setData("room_id", e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-4 py-3"
                                    >
                                        <option value="">
                                            選択してください
                                        </option>
                                    
                                        {availableRooms.map((room) => (
                                            <option
                                                key={room.id}
                                                value={room.id}
                                            >
                                                {room.room_number}号室
                                                {" "}
                                                {room.name}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.room_id && (
                                        <p className="mt-2 text-red-500">
                                            {errors.room_id}
                                        </p>
                                    )}
                                </div>

                                {/* 宿泊人数 */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block font-semibold text-sky-900">
                                            大人人数
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={data.adult_count}
                                            onChange={(e)=>
                                                setData("adult_count",e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 px-4 py-3"
                                        />
                                    </div>
                                        
                                    <div>
                                        <label className="mb-2 block font-semibold text-sky-900">
                                            子ども人数
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>
                                        
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.child_count}
                                            onChange={(e)=>
                                                setData("child_count",e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 px-4 py-3"
                                        />
                                    </div>
                                </div>

                                {/* 料金カード */}
                                <div className="rounded-xl border border-sky-200 bg-sky-50 p-6">
                                    <div className="flex justify-between">
                                        <div className="space-y-2 text-gray-700">
                                            <div>
                                                {days}泊
                                            </div>

                                            <div>
                                                大人
                                                {data.adult_count}
                                                名
                                            </div>

                                            <div>
                                                子ども
                                                {data.child_count}
                                                名
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-sky-900">
                                                合計人数：
                                                {Number(data.adult_count)+Number(data.child_count)}
                                                名
                                            </div>

                                            <div className="mt-6 text-gray-500">
                                                宿泊料金（税込）
                                            </div>

                                            <div className="text-4xl font-bold text-sky-800">
                                                {price
                                                    ? price.toLocaleString()
                                                    : 0
                                                }
                                                円
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 代表者名 */}
                                <div>
                                    <label className="mb-2 block font-semibold text-sky-900">
                                        代表者名
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={data.guest_name}
                                        onChange={(e) =>
                                            setData("guest_name", e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                    />

                                    {errors.guest_name && (
                                        <p className="mt-2 text-sm text-red-500">
                                            {errors.guest_name}
                                        </p>
                                    )}
                                </div>

                                {/* 性別・国籍 */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block font-semibold text-sky-900">
                                            性別
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <select
                                            className="w-full rounded-md border border-gray-300 px-4 py-3"
                                        >
                                            <option value="">
                                                選択してください
                                            </option>

                                            <option value="male">
                                                男性
                                            </option>

                                            <option value="female">
                                                女性
                                            </option>

                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold text-sky-900">
                                            国籍
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="日本"
                                            className="w-full rounded-md border border-gray-300 px-4 py-3"
                                        />
                                    </div>
                                </div>

                                {/* メールアドレス */}
                                <div>
                                    <label className="mb-2 block font-semibold text-sky-900">
                                        メールアドレス
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e)=>
                                            setData("email",e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-4 py-3"
                                    />
                                </div>

                                {/* 電話番号 */}
                                <div>
                                    <label className="mb-2 block font-semibold text-sky-900">
                                        電話番号
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e)=>
                                            setData("phone",e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-4 py-3"
                                    />
                                </div>

                                {/* 備考 */}
                                <div>
                                    <label className="mb-2 block font-semibold text-sky-900">
                                        ご要望・備考
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={data.note}
                                        onChange={(e)=>
                                            setData("note",e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-4 py-3"
                                    />
                                </div>

                                {/* 内容確認 */}
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="
                                            w-full
                                            rounded-lg
                                            bg-sky-800
                                            py-4
                                            text-lg
                                            font-bold
                                            text-white
                                            transition
                                            hover:bg-sky-900
                                            disabled:opacity-50
                                        "
                                    >
                                    
                                        予約内容を確認する
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
