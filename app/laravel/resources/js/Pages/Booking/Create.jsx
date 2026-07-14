import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Create({
     rooms=[], 
     search={} 
    }) {

    const [price, setPrice] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        room_id: '',
        checkin_date: '',
        checkout_date: '',
        guest_count: 1,
        adult_count: 1,
        child_count: 0,
        guest_name: '',
        email: '',
        phone: '',
        note: '',
        status: 1,
    });


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
    };


    // 予約登録
    const submit = (e) => {
        e.preventDefault();
        post(route('booking.store'));
    };


    // 空室検索
    const searchRoom = () => {
        post(
            route('booking.search')
        );
    };


    return (
        <div className="mx-auto max-w-2xl p-6">

            <h1 className="mb-6 text-2xl font-bold">
                宿泊予約フォーム
            </h1>


            <form onSubmit={submit} className="space-y-4">


                {/* チェックイン */}
                <div>
                    <label>チェックイン日</label>

                    <input
                        type="date"
                        className="w-full border p-2"
                        value={data.checkin_date}
                        onChange={(e) =>
                            setData(
                                'checkin_date',
                                e.target.value
                            )
                        }
                    />

                    {errors.checkin_date && (
                        <div className="text-red-500">
                            {errors.checkin_date}
                        </div>
                    )}
                </div>

                {/* チェックアウト */}
                <div>
                    <label>チェックアウト日</label>

                    <input
                        type="date"
                        className="w-full border p-2"
                        value={data.checkout_date}
                        onChange={(e) =>
                            setData(
                                'checkout_date',
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* 空室確認 */}
                <button
                    type="button"
                    onClick={searchRoom}
                    className="
                    rounded
                    bg-green-500
                    px-4
                    py-2
                    text-white
                    "
                >
                    空室確認
                </button>


                {/* 空室一覧 */}
                <div>
                    <h2 className="mt-6 mb-3 text-lg font-bold">
                        空室一覧
                    </h2>
                    {
                        rooms.length === 0 &&
                        <p>
                            空室確認を行ってください。
                        </p>
                    }

                    {
                        rooms.map(
                            room => (
                                <div
                                    key={room.id}
                                    className="mb-2"
                                >
                                    <label>
                                        <input
                                            type="radio"
                                            name="room_id"
                                            value={room.id}
                                            checked={
                                                data.room_id ==
                                                room.id
                                            }

                                            onChange={
                                                e =>
                                                    setData(
                                                        'room_id',
                                                        e.target.value
                                                    )
                                            }
                                        />

                                        {' '}
                                        {room.room_number}
                                        号室
                                        {' '}
                                        {room.name}
                                    </label>
                                </div>
                            )
                        )
                    }

                    {
                        errors.room_id &&

                        <div className="text-red-500">

                            {errors.room_id}

                        </div>
                    }
                </div>


                {/* 宿泊人数 */}
                <div>
                    <label>
                        宿泊人数
                    </label>
                    <input
                        type="number"
                        min="1"
                        className="w-full border p-2"
                        value={data.guest_count}
                        onChange={
                            e =>
                                setData(
                                    'guest_count',
                                    e.target.value
                                )
                        }
                    />
                </div>


                {/* 大人人数 */}
                <div>
                    <label>大人人数</label>

                    <input
                        type="number"
                        min="1"
                        className="w-full border p-2"
                        value={data.adult_count}
                        onChange={(e) =>
                            setData(
                                'adult_count',
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* 子供人数 */}
                <div>
                    <label>子供人数</label>

                    <input
                        type="number"
                        min="0"
                        className="w-full border p-2"
                        value={data.child_count}
                        onChange={(e) =>
                            setData(
                                'child_count',
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* 料金計算ボタン */}
                <button
                    type="button"
                    onClick={calculatePrice}
                    className="rounded bg-green-500 px-4 py-2 text-white"
                >
                    料金計算
                </button>


                {/* 金額表示追加 */}
                {price !== null && (
                    <div className="rounded border p-3">
                        <p>
                            合計料金：
                            {price.toLocaleString()}
                            円
                        </p>
                    </div>
                )}


                {/* 氏名 */}
                <div>
                    <label>氏名</label>

                    <input
                        type="text"
                        className="w-full border p-2"
                        value={data.guest_name}
                        onChange={(e) =>
                            setData(
                                'guest_name',
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* メール */}
                <div>
                    <label>メールアドレス</label>

                    <input
                        type="email"
                        className="w-full border p-2"
                        value={data.email}
                        onChange={(e) =>
                            setData(
                                'email',
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* 電話番号 */}
                <div>
                    <label>電話番号</label>

                    <input
                        type="text"
                        className="w-full border p-2"
                        value={data.phone}
                        onChange={(e) =>
                            setData(
                                'phone',
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* 備考 */}
                <div>
                    <label>備考</label>

                    <textarea
                        className="w-full border p-2"
                        value={data.note}
                        onChange={(e) =>
                            setData(
                                'note',
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* 登録 */}
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                >
                    予約する
                </button>

            </form>
        </div>
    );
}