import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, MessageSquare, Menu, Bot } from "lucide-react"

export default function CRMDashboardPage() {
    const features = [
        {
            title: "メンバー管理 (CRM)",
            description: "タグ付け、1対1トーク、リッチメニューの個別設定が行えます。",
            icon: Users,
            href: "/dashboard/crm/members",
            color: "text-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            title: "リッチメニュー管理",
            description: "リッチメニューの作成・編集・デフォルト設定を行います。",
            icon: Menu,
            href: "/dashboard/crm/rich-menus",
            color: "text-green-500",
            bgColor: "bg-green-50"
        },
        {
            title: "自動応答設定",
            description: "特定のキーワードに対する自動返信メッセージを設定します。",
            icon: Bot,
            href: "/dashboard/crm/auto-response",
            color: "text-purple-500",
            bgColor: "bg-purple-50"
        },
        {
            title: "1対1トーク履歴",
            description: "全てのメンバーとのチャット履歴を確認・返信します。",
            icon: MessageSquare,
            href: "/dashboard/crm/chats",
            color: "text-orange-500",
            bgColor: "bg-orange-50"
        }
    ]

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">CRM (L-Message)</h2>
                <p className="text-slate-500 mt-2">
                    LINE公式アカウントの機能を拡張し、顧客管理とコミュニケーションを強化します。
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.title} className="hover:shadow-md transition-shadow cursor-pointer">
                        <Link href={feature.href}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-medium">
                                    {feature.title}
                                </CardTitle>
                                <div className={`${feature.bgColor} p-2 rounded-full`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mt-2">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    )
}
