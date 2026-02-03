
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Dumbbell } from "lucide-react"
import { addMasterExercise, deleteMasterExercise } from "@/app/actions/settings_exercises"

const CATEGORIES = ["胸", "背中", "脚", "肩", "腕", "腹筋", "その他"]

export function ExerciseManager({ exercises }: { exercises: any[] }) {
    const [isPending, setIsPending] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("本当に削除しますか？")) return
        setIsPending(true)
        await deleteMasterExercise(id)
        setIsPending(false)
    }

    const handleAdd = async (formData: FormData) => {
        setIsPending(true)
        await addMasterExercise(formData)
        formRef.current?.reset()
        setIsPending(false)
    }

    // Group by Category
    const grouped: Record<string, any[]> = {}
    CATEGORIES.forEach(c => grouped[c] = [])
    exercises.forEach(e => {
        if (!grouped[e.category]) grouped[e.category] = []
        grouped[e.category].push(e)
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    種目・部位管理
                </CardTitle>
                <CardDescription>
                    タブを切り替えて各部位の種目を登録します。
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="胸" className="w-full">
                    <TabsList className="grid w-full grid-cols-7 mb-4">
                        {CATEGORIES.map(c => <TabsTrigger key={c} value={c} className="text-xs px-0">{c}</TabsTrigger>)}
                    </TabsList>

                    {CATEGORIES.map(cat => (
                        <TabsContent key={cat} value={cat}>
                            <div className="bg-slate-50 p-4 rounded-lg border mb-4">
                                <h3 className="font-bold text-sm text-slate-700 mb-3">{cat}の種目追加</h3>
                                <form ref={formRef} action={handleAdd} className="flex gap-2 items-center">
                                    <input type="hidden" name="category" value={cat} />
                                    <Input name="name" placeholder={`${cat}の種目名`} className="bg-white" required />
                                    <Button type="submit" disabled={isPending} size="sm">
                                        <Plus className="w-4 h-4 mr-1" /> 追加
                                    </Button>
                                </form>
                            </div>

                            <div className="space-y-2">
                                {grouped[cat].map(ex => (
                                    <div key={ex.id} className="flex justify-between items-center bg-white p-3 text-sm rounded border shadow-sm">
                                        <span className="font-bold text-slate-700">{ex.name}</span>
                                        <button disabled={isPending} onClick={() => handleDelete(ex.id)} className="text-slate-400 hover:text-red-500 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {grouped[cat].length === 0 && <div className="text-sm text-slate-400 p-4 text-center">登録された種目はありません</div>}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    )
}
