import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User as UserIcon } from "lucide-react"

async function getLineFriends() {
    const friends = await prisma.user.findMany({
        where: { isLineFriend: true },
        orderBy: { createdAt: 'desc' },
        include: { tags: true }
    })
    return friends
}

export default async function InfoManagementPage() {
    const friends = await getLineFriends()

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">情報管理</h2>
                <p className="text-slate-500 mt-2">
                    LINE公式アカウントの友だち（LINE連携ユーザー）の一覧です。
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-[#06C755]">●</span>
                        LINE友だちリスト ({friends.length}人)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">アイコン</TableHead>
                                <TableHead>名前 (LINE表示名)</TableHead>
                                <TableHead>タグ</TableHead>
                                <TableHead>登録日</TableHead>
                                <TableHead className="text-right">ステータス</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {friends.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        まだ友だちがいません
                                    </TableCell>
                                </TableRow>
                            ) : (
                                friends.map((friend) => (
                                    <TableRow key={friend.id}>
                                        <TableCell>
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarImage src={friend.linePictureUrl || ""} alt={friend.lineDisplayName || ""} />
                                                <AvatarFallback className="bg-slate-100 text-slate-400">
                                                    <UserIcon className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-base text-slate-700">{friend.name}</span>
                                                {friend.lineDisplayName && friend.lineDisplayName !== friend.name && (
                                                    <span className="text-xs text-[#06C755]">LINE: {friend.lineDisplayName}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {friend.tags.map(tag => (
                                                    <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(friend.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge className="bg-green-50 text-green-700 border-green-200">友だち</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
