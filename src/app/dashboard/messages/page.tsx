
import { ChatInterface } from "@/components/messages/ChatInterface"
import { MessageCircle } from "lucide-react"

export default function MessagesPage() {
    return (
        <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
                    <MessageCircle className="h-8 w-8 text-green-500" />
                    Messages (LINE Integrated)
                </h2>
                <p className="text-neutral-500">
                    メンバーとのメッセージ管理 - LINEと連携済み
                </p>
            </div>

            <ChatInterface />
        </div>
    )
}
