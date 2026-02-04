import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

async function getChatUsers() {
    // 1. Get users who have messages, ordered by most recent message
    const recentMessages = await prisma.chatMessage.findMany({
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
        select: { userId: true },
        take: 20
    });

    const recentUserIds = recentMessages.map(m => m.userId);

    // 2. Fetch those users
    const activeUsers = await prisma.user.findMany({
        where: { id: { in: recentUserIds } },
        include: {
            chats: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    // 3. Sort activeUsers manually to match the message order (findMany doesn't guarantee order of 'in' array)
    // Map userId -> User object
    const userMap = new Map(activeUsers.map(u => [u.id, u]));
    const sortedActiveUsers = recentUserIds.map(id => userMap.get(id)).filter(u => u !== undefined) as typeof activeUsers;

    // 4. Optionally append other LINE users who haven't messaged yet (if we want to show everyone)
    // For now, let's just also include recent LINE users who might not have messages?
    // User requested "If message comes, show it". The above logic covers that.
    // But they might also want to see friends to START a chat.

    // Let's get ALL line friends if the list is small, or just combine.
    // Given the request "Show in list", usually means "Active Chats". 
    // If they want to start a chat, they can go to "Member List".
    // But let's add up to 10 more recent LINE users who aren't in the active list just in case.

    if (sortedActiveUsers.length < 10) {
        const otherUsers = await prisma.user.findMany({
            where: {
                lineUserId: { not: null },
                id: { notIn: recentUserIds }
            },
            include: {
                chats: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return [...sortedActiveUsers, ...otherUsers];
    }

    return sortedActiveUsers;
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
                        <Link key={user.id} href={`/dashboard/crm/chats/${user.id}`} className="block hover:bg-slate-50 transition-colors">
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
