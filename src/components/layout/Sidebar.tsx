
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    MessageCircle,
    BookOpen,
    BarChart3,
    ChevronLeft
} from "lucide-react"
import Image from "next/image"
import UnreadBadge from "@/components/crm/UnreadBadge"

const sections = [
    {
        label: "Store",
        routes: [
            { label: "ダッシュボード", icon: LayoutDashboard, href: "/dashboard" },
            { label: "予約カレンダー", icon: Calendar, href: "/dashboard/calendar" },
            { label: "メンバー管理", icon: Users, href: "/dashboard/members" },
        ],
    },
    {
        label: "CRM",
        routes: [
            { label: "1:1チャット", icon: MessageCircle, href: "/dashboard/crm/chats" },
            { label: "リッチメニュー", icon: MessageCircle, href: "/dashboard/crm/rich-menus" },
            { label: "メッセージ", icon: MessageCircle, href: "/dashboard/crm/messages" },
        ],
    },
    {
        label: "Management",
        routes: [
            { label: "情報管理", icon: BookOpen, href: "/dashboard/info" },
            { label: "売上表", icon: BarChart3, href: "/dashboard/sales" },
            { label: "設定", icon: Settings, href: "/dashboard/settings" },
        ],
    },
]

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
    const pathname = usePathname()

    return (
        <div className="py-3 flex flex-col h-full bg-white border-r border-slate-100 text-slate-600 shadow-sm">
            <div className="px-3 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard" className="flex-1 flex justify-center">
                        <div className="relative w-14 h-14">
                            <Image
                                src="/tsuru_logo.png"
                                alt="TSURU Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {sections.map((section) => (
                        <div key={section.label}>
                            <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "text-xs group flex p-2 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200",
                                            pathname === route.href
                                                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                                : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon
                                                className={cn(
                                                    "h-4 w-4 mr-2 transition-colors flex-shrink-0",
                                                    pathname === route.href
                                                        ? "text-indigo-600"
                                                        : "text-slate-400 group-hover:text-indigo-500"
                                                )}
                                            />
                                            <span className="truncate">{route.label}</span>
                                            {route.label === "1:1チャット" && <UnreadBadge />}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-3 py-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400 text-center">
                    &copy; 2026 TSURU
                </div>
            </div>
        </div>
    )
}
