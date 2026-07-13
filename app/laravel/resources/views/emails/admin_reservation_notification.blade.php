<h2>新規予約通知</h2>


<p>
予約番号：
{{ $reservation->reservation_number }}
</p>


<p>
予約者：
{{ $reservation->guest_name }}
</p>


<p>
チェックイン：
{{ $reservation->checkin_date }}
</p>


<p>
チェックアウト：
{{ $reservation->checkout_date }}
</p>


<p>
金額：
{{ $reservation->amount }}円
</p>