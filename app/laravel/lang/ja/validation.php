<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | バリデーションエラーメッセージ
    |
    */

    'accepted' => ':attributeを承認してください。',

    'accepted_if' => ':otherが:valueの場合、:attributeを承認してください。',

    'active_url' => ':attributeには有効なURLを入力してください。',

    'after' => ':attributeには :date より後の日付を入力してください。',

    'after_or_equal' => ':attributeには :date 以降の日付を入力してください。',

    'alpha' => ':attributeはアルファベットのみ入力できます。',

    'alpha_dash' => ':attributeは英数字・ハイフン・アンダースコアのみ入力できます。',

    'alpha_num' => ':attributeは英数字のみ入力できます。',

    'any_of' => ':attributeの値が正しくありません。',

    'array' => ':attributeは配列で入力してください。',

    'ascii' => ':attributeは半角英数字で入力してください。',

    'attached' => ':attributeは既に添付されています。',

    'before' => ':attributeには :date より前の日付を入力してください。',

    'before_or_equal' => ':attributeには :date 以前の日付を入力してください。',


    'between' => [

        'array'   => ':attributeは:min～:max件で入力してください。',
        'file'    => ':attributeは:min～:maxKBの間で指定してください。',
        'numeric' => ':attributeは:min～:maxの間で入力してください。',
        'string'  => ':attributeは:min～:max文字で入力してください。',

    ],

    'boolean' => ':attributeには true または false を指定してください。',

    'confirmed' => ':attributeと確認用の入力が一致しません。',

    'contains' => ':attributeに必要な値が含まれていません。',

    'date' => ':attributeには有効な日付を入力してください。',

    'date_equals' => ':attributeには :date と同じ日付を入力してください。',

    'date_format' => ':attributeの形式が :format と一致しません。',

    'decimal' => ':attributeは小数点以下:decimal桁まで入力できます。',

    'declined' => ':attributeは拒否してください。',

    'declined_if' => ':otherが:valueの場合、:attributeは拒否してください。',

    'different' => ':attributeと:otherは異なる値を入力してください。',

    'digits' => ':attributeは:digits桁で入力してください。',

    'digits_between' => ':attributeは:min～:max桁で入力してください。',

    'dimensions' => ':attributeの画像サイズが正しくありません。',

    'distinct' => ':attributeに重複した値があります。',

    'email' => ':attributeには有効なメールアドレスを入力してください。',

    'ends_with' => ':attributeは次のいずれかで終わる必要があります。 :values',

    'enum' => ':attributeの選択が正しくありません。',

    'exists' => '選択した:attributeは存在しません。',

    'extensions' => ':attributeは次の拡張子のみ使用できます。:values',

    'file' => ':attributeにはファイルを指定してください。',

    'filled' => ':attributeは必須です。',

    'gt' => [

        'array'   => ':attributeは:value件より多くしてください。',
        'file'    => ':attributeは:valueKBより大きくしてください。',
        'numeric' => ':attributeは:valueより大きい値を入力してください。',
        'string'  => ':attributeは:value文字より長く入力してください。',

    ],

    'gte' => [

        'array'   => ':attributeは:value件以上必要です。',
        'file'    => ':attributeは:valueKB以上で指定してください。',
        'numeric' => ':attributeは:value以上を入力してください。',
        'string'  => ':attributeは:value文字以上入力してください。',

    ],


    'hex_color' => ':attributeは有効なカラーコードを入力してください。',

    'image' => ':attributeには画像ファイルを指定してください。',

    'in' => '選択した:attributeが正しくありません。',

    'in_array' => ':attributeは:otherに存在する値を指定してください。',

    'integer' => ':attributeには整数を入力してください。',

    'ip' => ':attributeには有効なIPアドレスを入力してください。',

    'ipv4' => ':attributeには有効なIPv4アドレスを入力してください。',

    'ipv6' => ':attributeには有効なIPv6アドレスを入力してください。',

    'json' => ':attributeには有効なJSON形式を入力してください。',

    'list' => ':attributeはリスト形式で入力してください。',

    'lowercase' => ':attributeは小文字で入力してください。',

    'lt' => [

        'array'   => ':attributeは:value件未満で入力してください。',
        'file'    => ':attributeは:valueKB未満で指定してください。',
        'numeric' => ':attributeは:value未満を入力してください。',
        'string'  => ':attributeは:value文字未満で入力してください。',

    ],

    'lte' => [

        'array'   => ':attributeは:value件以下で入力してください。',
        'file'    => ':attributeは:valueKB以下で指定してください。',
        'numeric' => ':attributeは:value以下を入力してください。',
        'string'  => ':attributeは:value文字以下で入力してください。',

    ],

    'mac_address' => ':attributeには有効なMACアドレスを入力してください。',

    'max' => [

        'array'   => ':attributeは:max件以下で入力してください。',
        'file'    => ':attributeは:maxKB以下のファイルを指定してください。',
        'numeric' => ':attributeは:max以下の数値を入力してください。',
        'string'  => ':attributeは:max文字以内で入力してください。',

    ],

    'max_digits' => ':attributeは:max桁以下で入力してください。',

    'mimes' => ':attributeは次の形式のファイルを指定してください。:values',

    'mimetypes' => ':attributeは次のMIMEタイプのファイルを指定してください。:values',

    'min' => [

        'array'   => ':attributeは:min件以上必要です。',
        'file'    => ':attributeは:minKB以上のファイルを指定してください。',
        'numeric' => ':attributeは:min以上を入力してください。',
        'string'  => ':attributeは:min文字以上入力してください。',

    ],

    'min_digits' => ':attributeは:min桁以上で入力してください。',

    'missing' => ':attributeは入力しないでください。',

    'missing_if' => ':otherが:valueの場合、:attributeは入力できません。',

    'missing_unless' => ':otherが:value以外の場合、:attributeは入力できません。',

    'missing_with' => ':valuesが存在する場合、:attributeは入力できません。',

    'missing_with_all' => ':valuesが存在する場合、:attributeは入力できません。',

    'multiple_of' => ':attributeは:valueの倍数で入力してください。',

    'not_in' => '選択した:attributeは無効です。',

    'not_regex' => ':attributeの形式が正しくありません。',

    'numeric' => ':attributeには数値を入力してください。',

    'password' => [

        'letters' => ':attributeには1文字以上の英字を含めてください。',

        'mixed' => ':attributeには大文字・小文字をそれぞれ1文字以上含めてください。',

        'numbers' => ':attributeには数字を1文字以上含めてください。',

        'symbols' => ':attributeには記号を1文字以上含めてください。',

        'uncompromised' => ':attributeは安全ではありません。別の値を指定してください。',

    ],

    'present' => ':attributeを入力してください。',

    'present_if' => ':otherが:valueの場合、:attributeを入力してください。',

    'present_unless' => ':otherが:value以外の場合、:attributeを入力してください。',

    'present_with' => ':valuesが存在する場合、:attributeを入力してください。',

    'present_with_all' => ':valuesが存在する場合、:attributeを入力してください。',

    'prohibited' => ':attributeは入力できません。',

    'prohibited_if' => ':otherが:valueの場合、:attributeは入力できません。',

    'prohibited_unless' => ':otherが:value以外の場合、:attributeは入力できません。',

    'prohibits' => ':attributeが入力されている場合、:otherは入力できません。',

    'regex' => ':attributeの形式が正しくありません。',

    'required' => ':attributeは必須です。',

    'required_array_keys' => ':attributeには次のキーが必要です。:values',

    'required_if' => ':otherが:valueの場合、:attributeは必須です。',

    'required_if_accepted' => ':otherが承認された場合、:attributeは必須です。',

    'required_if_declined' => ':otherが拒否された場合、:attributeは必須です。',

    'required_unless' => ':otherが:value以外の場合、:attributeは必須です。',

    'required_with' => ':valuesが入力されている場合、:attributeは必須です。',

    'required_with_all' => ':valuesが入力されている場合、:attributeは必須です。',

    'required_without' => ':valuesが未入力の場合、:attributeは必須です。',

    'required_without_all' => ':valuesがすべて未入力の場合、:attributeは必須です。',

    'same' => ':attributeと:otherが一致しません。',

    'size' => [

        'array' => ':attributeは:size件で入力してください。',

        'file' => ':attributeは:sizeKBのファイルを指定してください。',

        'numeric' => ':attributeは:sizeを入力してください。',

        'string' => ':attributeは:size文字で入力してください。',

    ],


    'starts_with' => ':attributeは次のいずれかで始まる必要があります。:values',

    'string' => ':attributeは文字列で入力してください。',

    'timezone' => ':attributeには有効なタイムゾーンを入力してください。',

    'ulid' => ':attributeには有効なULIDを入力してください。',

    'unique' => ':attributeは既に登録されています。',

    'uploaded' => ':attributeのアップロードに失敗しました。',

    'uppercase' => ':attributeは大文字で入力してください。',

    'url' => ':attributeには有効なURLを入力してください。',

    'uuid' => ':attributeには有効なUUIDを入力してください。',


    // カスタムバリデーション
    'custom' => [

        'checkin_date' => [
            'required' => 'チェックイン日を入力してください。',
        ],

        'checkout_date' => [
            'required' => 'チェックアウト日を入力してください。',
            'after' => 'チェックアウト日はチェックイン日より後の日付を指定してください。',
        ],

        'guest_name' => [
            'required' => '宿泊者名を入力してください。',
        ],

        'room_id' => [
            'required' => '部屋を選択してください。',
        ],

        'email' => [
            'email' => 'メールアドレスの形式が正しくありません。',
        ],

    ],


    // カスタムバリデーションattributes
    'attributes' => [

        'reservation_number' => '予約番号',
        'reservation_name'   => '予約名',
        'reservation_site'   => '予約サイト',
        'reservation_date'   => '予約日',

        'guest_name'         => '宿泊者名',
        'guest_count'        => '宿泊人数',
        'adult_count'        => '大人人数',
        'child_count'        => '子供人数',

        'room_id'            => '部屋',

        'checkin_date'       => 'チェックイン日',
        'checkout_date'      => 'チェックアウト日',

        'phone'              => '電話番号',
        'email'              => 'メールアドレス',
        'address'            => '住所',

        'payment_method'     => '支払方法',
        'payment_status'     => '支払状況',

        'total_price'        => '宿泊料金',

        'status'             => 'ステータス',

        'note'               => '備考',

    ],


    // カスタムバリデーションvalues
    'values' => [

        'status' => [
            1 => '予約済み',
            2 => 'チェックイン済み',
            3 => '滞在中',
            4 => '延泊中',
            5 => 'チェックアウト済み',
            8 => '保留',
            9 => 'キャンセル',
        ],

        'payment_status' => [
            'paid' => '支払済み',
            'unpaid' => '未払い',
        ],

    ],

];