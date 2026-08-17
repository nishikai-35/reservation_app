# 予約管理システム

Laravel + PHP + React + Tailwind CSS を使用した宿泊施設向け予約管理システムです。

予約情報の登録・編集・削除、部屋の空室管理、外部予約サイトからのCSVインポート、ユーザー管理、売上・予約データの集計などを行います。

---

## 1. システム概要

本システムでは、宿泊施設の予約情報を一元管理します。

主な機能は以下の通りです。

- ログイン・ログアウト
- ダッシュボード
- 予約一覧
- 予約登録・編集・削除
- 部屋状況カレンダー
- 空室検索
- 予約料金自動計算
- 予約サイトCSVインポート
- CSVインポートプレビュー
- ユーザー管理
- ユーザー権限管理
- プロフィール編集
- 部屋マスター管理
- 売上・予約データ集計
- 集計データCSV出力

---

## 2. 技術構成

### Backend

- PHP 8.3
- Laravel 13
- Laravel Inertia
- MySQL

### Frontend

- React
- Inertia.js
- Tailwind CSS
- Vite
- Recharts

### 認証・権限

- Laravel Breeze
- Spatie Laravel Permission

### 開発環境

- Windows
- PowerShell
- docker
- Git
- GitHub


---

## 3. ディレクトリ構成

主要なディレクトリ構成です。

```text
reservation_app/
├── app/
│   └── laravel/
│       ├── app/
│       │   ├── Http/
│       │   │   ├── Controllers/
│       │   │   └── Requests/
│       │   │
│       │   ├── Mail/
│       │   ├── Models/
│       │   └── Services/
│       │       └── Importers/
│       │
│       ├── database/
│       │   ├── migrations/
│       │   └── seeders/
│       │
│       ├── resources/
│       │   ├── js/
│       │   │   ├── Components/
│       │   │   ├── Layouts/
│       │   │   └── Pages/
│       │   │
│       │   └── css/
│       │
│       ├── routes/
│       │   ├── web.php
│       │   └── auth.php
│       │
│       ├── public/
│       │   └── build/
│       │
│       ├── storage/
│       ├── .env
│       ├── artisan
│       ├── composer.json
│       └── package.json
│
├── docker/
│   ├── nginx/
│   └── php/
│
├── docker-compose.yml
└── README.md