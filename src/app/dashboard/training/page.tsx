
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function TrainingPage() {
    const logs = await prisma.trainingLog.findMany({
        where: { memberId: "demo-member-id" },
        include: { sets: true },
        orderBy: { trainingDate: "desc" }
    })

    return (
        <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold text-neutral-900">Training Logs</h2>
                <p className="text-neutral-500">トレーニング履歴</p>
            </div>

            <div className="space-y-4">
                {logs.map((log) => (
                    <Card key={log.id}>
                        <CardHeader>
                            <CardTitle>{new Date(log.trainingDate).toLocaleDateString()} - {log.durationMinutes}min</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {log.notes && <p className="text-sm text-neutral-600 mb-4">{log.notes}</p>}
                                {log.sets.map((set) => (
                                    <div key={set.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                                        <span>{set.exerciseName}</span>
                                        <span>{set.weight}kg x {set.reps}reps</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
