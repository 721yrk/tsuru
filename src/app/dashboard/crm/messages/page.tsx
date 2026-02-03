import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle, Send, Repeat, Bot, History } from "lucide-react"

export default function MessagingDashboardPage() {
    const features = [
        {
            title: "一斉配信 (Broadcast)",
            description: "友だち全員または特定のセグメントにメッセージを一斉送信します。",
            icon: Send,
            href: "/dashboard/crm/messages/broadcast",
            color: "text-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            title: "ステップ配信",
            description: "友だち追加やタグ付与をトリガーに、あらかじめ用意したシナリオを自動配信します。",
            icon: Repeat,
            href: "/dashboard/crm/messages/step",
            color: "text-green-500",
            bgColor: "bg-green-50"
        },
        {
            title: "自動応答",
            description: "特定のキーワードに反応して自動で返信するメッセージを設定します。",
            icon: Bot,
            href: "/dashboard/crm/messages/auto-response",
            color: "text-purple-500",
            bgColor: "bg-purple-50"
        },
        {
            title: "配信履歴",
            description: "過去に送信したメッセージの開封率や到達数を確認します。",
            icon: History,
            href: "/dashboard/crm/messages/history",
            color: "text-slate-500",
            bgColor: "bg-slate-50"
        }
    ]

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">メッセージ配信管理</h2>
                <p className="text-slate-500 mt-2">
                    LINE公式アカウントのメッセージ配信機能を管理します。
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
