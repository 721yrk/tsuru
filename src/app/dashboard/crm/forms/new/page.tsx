"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, GripVertical } from "lucide-react"

type Question = {
    id: string
    type: "TEXT" | "SELECT" | "DATE"
    label: string
    options?: string // Comma separated for MVP
    required: boolean
}

export default function NewFormPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [questions, setQuestions] = useState<Question[]>([
        { id: "1", type: "TEXT", label: "お名前", required: true }
    ])

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now().toString(), type: "TEXT", label: "新しい質問", required: false }
        ])
    }

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const handleSave = async () => {
        if (!title) return

        try {
            const response = await fetch("/api/crm/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    questions: questions.map((q, index) => ({
                        ...q,
                        orderIndex: index,
                        options: q.options ? q.options.split(",").map(s => s.trim()) : []
                    }))
                })
            })

            if (response.ok) {
                router.push("/dashboard/crm/forms")
            }
        } catch (error) {
            console.error(error)
            alert("エラーが発生しました")
        }
    }

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">新規フォーム作成</h2>
                    <p className="text-slate-500 mt-2">
                        アンケートや申込フォームを作成します。
                    </p>
                </div>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    保存する
                </Button>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label>フォームタイトル</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例：初回カウンセリングシート"
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <Card key={q.id}>
                            <CardContent className="pt-6 flex gap-4">
                                <div className="mt-2 text-slate-400 cursor-move">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>質問文</Label>
                                            <Input
                                                value={q.label}
                                                onChange={(e) => updateQuestion(q.id, "label", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>タイプ</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                                value={q.type}
                                                onChange={(e) => updateQuestion(q.id, "type", e.target.value)}
                                            >
                                                <option value="TEXT">テキスト入力</option>
                                                <option value="SELECT">選択肢 (ドロップダウン)</option>
                                                <option value="DATE">日付選択</option>
                                            </select>
                                        </div>
                                    </div>

                                    {q.type === "SELECT" && (
                                        <div className="space-y-2">
                                            <Label>選択肢 (カンマ区切り)</Label>
                                            <Input
                                                value={q.options || ""}
                                                onChange={(e) => updateQuestion(q.id, "options", e.target.value)}
                                                placeholder="例：男性, 女性, その他"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`req-${q.id}`}
                                            checked={q.required}
                                            onChange={(e) => updateQuestion(q.id, "required", e.target.checked)}
                                        />
                                        <Label htmlFor={`req-${q.id}`}>必須項目にする</Label>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-red-500" onClick={() => removeQuestion(q.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button variant="outline" className="w-full border-dashed" onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    質問を追加
                </Button>
            </div>
        </div>
    )
}
