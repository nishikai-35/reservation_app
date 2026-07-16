import { Head, Link } from '@inertiajs/react';

export default function PasswordSetupComplete() {

    return (
        <>
            <Head title="パスワード設定完了" />

            <div>
                <h1>
                    パスワード設定が完了しました
                </h1>

                <p>
                    新しいパスワードでログインしてください。
                </p>

                <Link href="/login">
                    ログイン画面へ
                </Link>
            </div>
        </>
    );
}
