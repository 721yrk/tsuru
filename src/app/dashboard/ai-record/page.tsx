
import { prisma } from "@/lib/db"
import { AiRecorder } from "@/components/ai/AiRecorder"
import { Bot } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AiRecordPage() {
    // Get members for dropdown
    const members = await prisma.member.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })

    // Get a trainer ID (In real app, get current session user)
    const trainer = await prisma.user.findFirst({ where: { role: 'TRAINER' } })
    const trainerId = trainer?.id || "demo-trainer"

    return (
        <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
                    <Bot className="h-8 w-8 text-blue-600" />
                    AI Automation Chart
                </h2>
                <p className="text-neutral-500">
                    全自動カルテ生成 (Automated Charting) - 会話をAIが記録・要約します
                </p>
            </div>

            <AiRecorder members={members} currentTrainerId={trainerId} />
        </div>
    )
}
