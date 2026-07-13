<h2>予約受付完了</h2>

<p>{{ $reservation->guest_name }} 様</p>

<p>ご予約ありがとうございます。</p>

<p>以下の内容で予約を受け付けました。</p>

<hr>

<p>予約番号：{{ $reservation->reservation_number }}</p>

<p>チェックイン日：{{ $reservation->checkin_date }}</p>

<p>チェックアウト日：{{ $reservation->checkout_date }}</p>

<p>宿泊人数：{{ $reservation->guest_count }}名</p>

<p>予約金額：{{ number_format($reservation->amount) }}円</p>

<hr>

<p>ご来館をお待ちしております。</p>