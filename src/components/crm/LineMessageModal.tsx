'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"
import { sendLineMessageToUser } from "@/app/actions/line_actions"

interface LineMessageModalProps {
    userId: string
    userName: string
    lineDisplayName?: string | null
}

export function LineMessageModal({ userId, userName, lineDisplayName }: LineMessageModalProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    const handleSend = async () => {
        if (!message.trim()) return

        setIsSending(true)
        try {
            const result = await sendLineMessageToUser(userId, message)
            if (result.success) {
                alert(result.message)
                setMessage("")
                setOpen(false)
            } else {
                alert(result.error)
            }
        } catch (error) {
            console.error(error)
            alert('エラーが発生しました')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    メッセージ
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>LINEメッセージ送信</DialogTitle>
                    <DialogDescription>
                        {userName} {lineDisplayName && `(${lineDisplayName})`} 様にメッセージを送信します。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="メッセージを入力してください..."
                        className="min-h-[150px]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSending}>
                        キャンセル
                    </Button>
                    <Button onClick={handleSend} disabled={isSending || !message.trim()} className="bg-[#06C755] hover:bg-[#05b34d] text-white">
                        {isSending ? '送信中...' : '送信する'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
