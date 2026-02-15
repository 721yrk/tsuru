import { prisma } from "@/lib/db"
import { createTag, deleteTag } from "@/app/actions/crm_actions" // Client components usually call actions directly or via props
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag as TagIcon, Trash2, Plus } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Server Action Wrapper for this page form
async function addTagAction(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const color = formData.get("color") as string
    if (name) {
        await createTag(name, color)
    }
}

async function removeTagAction(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    if (id) {
        await deleteTag(id)
    }
}

export default async function TagsPage() {
    const tags = await prisma.tag.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">タグ管理</h2>
                <p className="text-slate-500 mt-2">
                    顧客を分類するためのタグを作成・管理します。
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>新しいタグを作成</CardTitle>
                        <CardDescription>
                            タグ名と色を指定して追加してください。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={addTagAction} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">タグ名</label>
                                <Input name="name" placeholder="例：VIP会員, 30代男性, キャンペーン対象" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">カラー</label>
                                <div className="flex gap-2">
                                    <Input type="color" name="color" defaultValue="#ec4899" className="w-12 h-10 p-1" />
                                    <span className="text-xs text-slate-400 self-center">クリックして色を選択</span>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" />
                                追加する
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>登録済みタグ一覧 ({tags.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {tags.length === 0 && <p className="text-sm text-slate-400">タグはまだありません</p>}
                            {tags.map((tag) => (
                                <div key={tag.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                    <span className="font-medium text-sm text-slate-700">{tag.name}</span>
                                    <span className="text-xs bg-slate-100 px-1.5 rounded-full text-slate-500">
                                        {tag._count.users}
                                    </span>
                                    <form action={removeTagAction}>
                                        <input type="hidden" name="id" value={tag.id} />
                                        <button type="submit" className="text-slate-400 hover:text-red-500 ml-1">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
