
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    Users,
    Mic,
    Settings,
    Leaf,
    MessageCircle,
    BookOpen
} from "lucide-react"

const routes = [
    {
        label: "ダッシュボード",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "予約カレンダー",
        icon: Calendar,
        href: "/dashboard/calendar",
    },
    {
        label: "メンバー管理",
        icon: Users,
        href: "/dashboard/members",
    },
    {
        label: "LINEメッセージ",
        icon: MessageCircle,
        href: "/dashboard/messages",
    },
    {
        label: "AI自動カルテ",
        icon: Mic,
        href: "/dashboard/ai-record",
    },
    {
        label: "説明ツール",
        icon: BookOpen,
        href: "/dashboard/education",
        color: "text-orange-500",
    },
    {
        label: "設定",
        icon: Settings,
        href: "/dashboard/settings",
    },
]

export const Sidebar = () => {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r border-slate-100 text-slate-600 shadow-sm">
            <div className="px-6 py-4 flex-1">
                <Link href="/dashboard" className="flex flex-col mb-10 pl-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Leaf className="w-6 h-6 text-emerald-600" />
                        <h1 className="text-2xl font-serif text-slate-800 tracking-tight">
                            SHEEKA
                        </h1>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Powered by wellness space CLOVER.
                    </p>
                </Link>

                <div className="space-y-2">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                                pathname === route.href
                                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                    : "text-slate-500 hover:text-emerald-600 hover:bg-slate-50"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-colors",
                                    pathname === route.href ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                                )} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-50">
                <div className="text-xs text-slate-400 text-center">
                    &copy; 2026 SHEEKA Platform
                </div>
            </div>
        </div>
    )
}
