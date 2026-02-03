import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Image as ImageIcon, Trash2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getRichMenus() {
    const menus = await prisma.richMenu.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            users: { select: { id: true } } // Count users using this menu
        }
    })
    return menus
}

export default async function RichMenuPage() {
    const menus = await getRichMenus()

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">リッチメニュー管理</h2>
                    <p className="text-slate-500 mt-2">
                        LINEのトーク画面下部に表示するメニューを作成・管理します。
                    </p>
                </div>
                <Link href="/dashboard/crm/rich-menus/new">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        新規作成
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {menus.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">リッチメニューがありません</h3>
                        <p className="text-slate-500 mt-1 mb-6">新しいリッチメニューを作成して、ユーザーに表示しましょう。</p>
                        <Link href="/dashboard/crm/rich-menus/new">
                            <Button variant="outline">作成する</Button>
                        </Link>
                    </div>
                )}

                {menus.map((menu) => (
                    <Card key={menu.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-[2/1] bg-slate-100 relative">
                            {menu.imageUrl ? (
                                <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-10 h-10" />
                                </div>
                            )}
                            {menu.selected && (
                                <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600">
                                    デフォルト
                                </Badge>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg truncate">{menu.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                    利用者: {menu.users.length}人
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between border-t p-4 bg-slate-50/50">
                            <Button variant="ghost" size="sm" className="text-slate-500">
                                編集
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
