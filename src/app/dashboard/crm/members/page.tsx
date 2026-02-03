import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Tag as TagIcon, MoreHorizontal } from "lucide-react"
import Link from "next/link"

// This page will list all users (MEMBERS) and their CRM data (Tags, Rich Menu, Attributes)
async function getMembers(query: string = "") {
    const members = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { lineUserId: { contains: query, mode: 'insensitive' } }
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
                                    placeholder="名前、LINE ID、メールで検索..."
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
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{member.name}</span>
                                            <span className="text-xs text-slate-400">{member.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {member.lineUserId ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                LINE連携済
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-500">
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
                                        <Link href={`/dashboard/crm/members/${member.id}`}>
                                            <Button variant="ghost" size="sm">
                                                詳細
                                            </Button>
                                        </Link>
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
