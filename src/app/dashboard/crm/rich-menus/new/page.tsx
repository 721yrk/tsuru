"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"

export default function NewRichMenuPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [chatBarText, setChatBarText] = useState("メニューを開く")
    const [layout, setLayout] = useState("Compact_2") // Simple default: 2 buttons side-by-side

    // In a real app, we'd have a visual editor for defining areas.
    // For this MVP, we'll pre-define a "Booking Menu" template.
    const [actionType, setActionType] = useState("booking_default")

    const handleCreate = async () => {
        setIsLoading(true)
        try {
            // Mock API call confirmation
            // In reality, this would upload the image and call LINE API
            const response = await fetch("/api/crm/rich-menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    chatBarText,
                    layout,
                    actionType // "booking_default" implies linking the left button to Booking
                })
            })

            if (response.ok) {
                router.push("/dashboard/crm/rich-menus")
                router.refresh()
            } else {
                alert("作成に失敗しました")
            }
        } catch (error) {
            console.error(error)
            alert("エラーが発生しました")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">リッチメニュー新規作成</h2>
                <p className="text-slate-500 mt-2">
                    LINEのトーク画面に表示するメニューを作成します。
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>基本設定</CardTitle>
                        <CardDescription>管理用の名前と表示設定を入力してください。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">メニュー名（管理用）</Label>
                            <Input
                                id="name"
                                placeholder="例：基本メニュー（予約・マイページ）"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="chatBar">メニューバーのテキスト</Label>
                            <Input
                                id="chatBar"
                                placeholder="例：メニューを開く / 予約はこちら"
                                value={chatBarText}
                                onChange={(e) => setChatBarText(e.target.value)}
                            />
                            <p className="text-xs text-slate-400">トーク画面下部のバーに表示される文字です。</p>
                        </div>

                        <div className="space-y-2">
                            <Label>テンプレート選択</Label>
                            <Select value={layout} onValueChange={setLayout}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Compact_2">コンパクト（ボタン2つ）</SelectItem>
                                    <SelectItem value="Large_6">ラージ（ボタン6つ）</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>コンテンツ設定</CardTitle>
                        <CardDescription>
                            現在、**「予約テンプレート」**が自動適用されます。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-100 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-slate-300">
                            <div className="w-full max-w-md aspect-[2/1] bg-white border border-slate-200 rounded flex relative overflow-hidden">
                                {/* Visual Mock of the menu based on selection */}
                                <div className="w-1/2 h-full border-r border-slate-100 flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold">
                                    予約する
                                </div>
                                <div className="w-1/2 h-full flex items-center justify-center text-slate-500">
                                    マイページ
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">
                                左側：予約画面へリンク<br />
                                右側：マイページへリンク
                            </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                            <strong>確認:</strong> 作成後、このメニューを自動的にデフォルトとして設定しますか？
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" id="defaultCheck" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                <label htmlFor="defaultCheck">はい、デフォルトに設定する</label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>キャンセル</Button>
                <Button onClick={handleCreate} disabled={isLoading || !name} className="bg-emerald-600 hover:bg-emerald-700">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    保存して作成
                </Button>
            </div>
        </div>
    )
}
