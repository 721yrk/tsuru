import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Send, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getBroadcasts() {
    const broadcasts = await prisma.broadcast.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return broadcasts
}

export default async function BroadcastListPage() {
    const broadcasts = await getBroadcasts()

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">一斉配信 (Broadcast)</h2>
                    <p className="text-slate-500 mt-2">
                        作成したメッセージの一覧です。
                    </p>
                </div>
                <Link href="/dashboard/crm/messages/broadcast/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        新規メッセージ作成
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {broadcasts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                        <Send className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">メッセージがありません</h3>
                        <p className="text-slate-500 mt-1 mb-6">新しいメッセージを作成して、ユーザーに情報を届けましょう。</p>
                        <Link href="/dashboard/crm/messages/broadcast/new">
                            <Button variant="outline">作成する</Button>
                        </Link>
                    </div>
                )}

                {broadcasts.map((broadcast) => (
                    <Card key={broadcast.id} className="hover:shadow-sm transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 rounded-full">
                                    <FileText className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{broadcast.title}</CardTitle>
                                    <CardDescription>
                                        作成日: {new Date(broadcast.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={
                                    broadcast.status === 'SENT' ? 'default' :
                                        broadcast.status === 'DRAFT' ? 'secondary' : 'outline'
                                }>
                                    {broadcast.status === 'SENT' ? '送信済み' :
                                        broadcast.status === 'DRAFT' ? '下書き' : broadcast.status}
                                </Badge>
                                {broadcast.status === 'SENT' && (
                                    <span className="text-sm text-slate-500">
                                        送信数: {broadcast.sentCount}
                                    </span>
                                )}
                                <Link href={`/dashboard/crm/messages/broadcast/${broadcast.id}`}>
                                    <Button variant="ghost" size="sm">編集/詳細</Button>
                                </Link>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
}
