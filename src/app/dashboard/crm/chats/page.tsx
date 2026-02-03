import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

async function getChatUsers() {
    // Logic to find users with chat history or all connected users
    // For now, list recent active users
    const users = await prisma.user.findMany({
        where: { lineUserId: { not: null } },
        include: {
            chats: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        take: 20
    })
    return users
}

export default async function ChatListPage() {
    const users = await getChatUsers()

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] bg-white">
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">1:1チャット</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="名前で検索" className="pl-9 bg-slate-50" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            まだチャット相手がいません
                        </div>
                    )}
                    {users.map(user => (
                        <Link key={user.id} href={`/dashboard/crm/members/${user.id}`} className="block hover:bg-slate-50 transition-colors">
                            <div className="p-4 flex gap-3 border-b border-slate-50">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                        <span className="text-[10px] text-slate-400">
                                            {user.chats[0] ? new Date(user.chats[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {user.chats[0] ? user.chats[0].content : 'メッセージ履歴なし'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Chat Area Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-slate-50/50">
                <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">左側のリストからチャットを開始する相手を選択してください</p>
                </div>
            </div>
        </div>
    )
}
