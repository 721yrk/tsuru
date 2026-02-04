import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Tag as TagIcon, MoreHorizontal, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { LineMessageModal } from "@/components/crm/LineMessageModal"

// This page will list all users (MEMBERS) and their CRM data (Tags, Rich Menu, Attributes)
async function getMembers(query: string = "") {
    const members = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { lineUserId: { contains: query, mode: 'insensitive' } },
                { lineDisplayName: { contains: query, mode: 'insensitive' } } // Added search by LINE Name
            ]
        },
        include: {
            tags: true,
            richMenu: true,
            memberProfile: true
        },
        orderBy: { createdAt: 'desc' }
    })
    return members
}

export default async function MemberListPage({ searchParams }: { searchParams: { q?: string } }) {
    const query = searchParams.q || ""
    const members = await getMembers(query)

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">顧客管理 (CRM)</h2>
                    <p className="text-slate-500 mt-2">
                        LINE友だちの検索、タグ付け、詳細情報の管理を行います。
                    </p>
                </div>
                <Button variant="outline">
                    <TagIcon className="w-4 h-4 mr-2" />
                    タグ管理
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <form>
                                <Input
                                    name="q"
                                    placeholder="名前、LINE名、IDで検索..."
                                    className="pl-9"
                                    defaultValue={query}
                                />
                            </form>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">LINE</TableHead>
                                <TableHead>ユーザー名</TableHead>
                                <TableHead>ステータス</TableHead>
                                <TableHead>タグ</TableHead>
                                <TableHead>リッチメニュー</TableHead>
                                <TableHead>登録日</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id} className="cursor-pointer hover:bg-slate-50">
                                    <TableCell>
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarImage src={member.linePictureUrl || ""} alt={member.lineDisplayName || ""} />
                                                <AvatarFallback className="bg-slate-100 text-slate-400">
                                                    <UserIcon className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            {member.isLineFriend && (
                                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 border-2 border-white rounded-full bg-[#06C755]" title="友だち登録中" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="text-base text-slate-700">{member.name}</span>
                                            {member.lineDisplayName && member.lineDisplayName !== member.name && (
                                                <span className="text-xs text-[#06C755] flex items-center gap-1">
                                                    LINE: {member.lineDisplayName}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {member.isLineFriend ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                友だち
                                            </Badge>
                                        ) : member.lineUserId ? (
                                            <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">
                                                ブロック/未追加
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400">
                                                未連携
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {member.tags.length > 0 ? (
                                                member.tags.map(tag => (
                                                    <Badge key={tag.id} className="bg-slate-100 text-slate-600 hover:bg-slate-200" style={{ borderColor: tag.color }}>
                                                        {tag.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-300">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {member.richMenu ? (
                                            <span className="text-sm text-slate-600">{member.richMenu.name}</span>
                                        ) : (
                                            <span className="text-xs text-slate-400">デフォルト</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            {member.isLineFriend && (
                                                <LineMessageModal
                                                    userId={member.id}
                                                    userName={member.name}
                                                    lineDisplayName={member.lineDisplayName}
                                                />
                                            )}
                                            <Link href={`/dashboard/crm/members/${member.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    詳細
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
