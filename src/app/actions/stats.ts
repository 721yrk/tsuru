
"use server"

import { prisma } from "@/lib/db"

export async function getExerciseStats(memberId: string, exerciseName: string) {
    const logs = await prisma.trainingSet.findMany({
        where: {
            trainingLog: { memberId },
            exerciseName
        },
        select: {
            weight: true,
            reps: true,
            createdAt: true
        }
    })

    if (logs.length === 0) return null

    // Calc Max Weight
    const max = logs.reduce((prev, current) => (prev.weight > current.weight) ? prev : current)
    // Calc Min Weight (why? maybe starting point?)
    const min = logs.reduce((prev, current) => (prev.weight < current.weight) ? prev : current)

    return {
        max: { weight: max.weight, reps: max.reps, date: max.createdAt.toLocaleDateString('ja-JP') },
        min: { weight: min.weight, reps: min.reps, date: min.createdAt.toLocaleDateString('ja-JP') }
    }
}
