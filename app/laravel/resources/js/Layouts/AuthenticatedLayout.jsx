import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {

    const { auth } = usePage().props;

    const user = auth.user;

    const isAdmin =
        auth.roles.includes('admin');

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const menus = [
        {
            label: 'ホーム',
            route: 'dashboard',
        },
        {
            label: '予約一覧',
            route: 'reservations.index',
        },
        {
            label: '部屋状況',
            route: 'room-calendar.index',
        },
        {
            label: '予約インポート',
            route: 'reservations.import',
            admin: true,
        },
        {
            label: '集計',
            route: 'analysis.index',
            admin: true,
        },
        {
            label: 'マスター管理',
            route: 'rooms.index',
            admin: true,
        },
        {
            label: 'ユーザー管理',
            route: 'users.index',
            admin: true,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-slate-800 shadow-lg">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex h-16 items-center justify-between">

                        {/* 左側 */}
                        <div className="flex items-center gap-8">

                            <Link href={route('dashboard')}>
                                <ApplicationLogo className="h-10 w-auto text-white" />
                            </Link>

                            <div className="flex items-center gap-2">

                                {menus.map((menu) => {
                                
                                    if (menu.admin && !isAdmin) {
                                        return null;
                                    }
                                
                                    return (
                                        <Link
                                            key={menu.route}
                                            href={route(menu.route)}
                                            className={
                                                route().current(menu.route)
                                                    ? "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                                                    : "rounded-md px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
                                            }
                                        >
                                            {menu.label}
                                        </Link>
                                    );
                                
                                })}

                            </div>
                            
                        </div>
                            
                        {/* 右側 */}
                            
                        <Dropdown>
                            
                            <Dropdown.Trigger>
                            
                                <button
                                    className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-lg
                                    bg-slate-700
                                    px-4
                                    py-2
                                    text-white
                                    hover:bg-slate-600
                                    transition
                                    "
                                >
                                
                                    <div className="text-right">
                            
                                        <div className="text-xs text-slate-300">
                                            ログイン中
                                        </div>
                            
                                        <div className="font-semibold">
                                            {user.name}
                                        </div>
                            
                                    </div>
                            
                                    <svg
                                        className="h-4 w-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                            
                                </button>
                            
                            </Dropdown.Trigger>
                            
                            <Dropdown.Content>
                            
                                <Dropdown.Link
                                    href={route('profile.edit')}
                                >
                                    プロフィール
                                </Dropdown.Link>
                            
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    ログアウト
                                </Dropdown.Link>
                            
                            </Dropdown.Content>
                            
                        </Dropdown>
                            
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-7xl px-6 py-5">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
