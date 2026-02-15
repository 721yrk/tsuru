"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Save } from "lucide-react"

export default function NewBroadcastPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [messageText, setMessageText] = useState("")
    const [targetType, setTargetType] = useState("ALL") // ALL or TAG

    const handleSave = async (status: "DRAFT" | "SENDING") => {
        if (!title || !messageText) return
        setIsLoading(true)

        try {
            const response = await fetch("/api/crm/messages/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content: [{ type: "text", text: messageText }], // Simple text message object
                    targetFilter: targetType === "ALL" ? null : { type: "TAG", tagId: "dummy_tag" }, // Mock target
                    status: status
                })
            })

            if (response.ok) {
                router.push("/dashboard/crm/messages/broadcast")
                router.refresh()
            } else {
                alert("保存に失敗しました")
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">新規メッセージ作成</h2>
                    <p className="text-slate-500 mt-2">
                        配信内容と送信先を設定してください。
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>メッセージ内容</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">管理用タイトル</Label>
                                <Input
                                    id="title"
                                    placeholder="例：2月のキャンペーン告知"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">本文</Label>
                                <Textarea
                                    id="message"
                                    placeholder="ここにメッセージを入力してください"
                                    className="min-h-[200px]"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                />
                                <p className="text-xs text-slate-400">
                                    ※現在はテキストメッセージのみ対応しています。
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>配信設定</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>送信先</Label>
                                <Select value={targetType} onValueChange={setTargetType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">友だち全員</SelectItem>
                                        <SelectItem value="TAG" disabled>特定のタグ（準備中）</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>アクション</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleSave("DRAFT")}
                                disabled={isLoading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                下書き保存
                            </Button>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => handleSave("SENDING")}
                                disabled={isLoading || !title || !messageText}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                即時配信する
                            </Button>
                            <p className="text-xs text-slate-500 text-center">
                                ※「即時配信」を押すと、実際にLINEユーザーへ送信されます。
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
