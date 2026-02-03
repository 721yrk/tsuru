
"use server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createTrainingLog(data: any) {
    // Simplified restoration
    try {
        const log = await prisma.trainingLog.create({
            data: {
                memberId: data.memberId,
                trainingDate: new Date(data.date),
                durationMinutes: Number(data.duration),
                notes: data.notes,
                sets: {
                    create: data.sets.map((s: any) => ({
                        exerciseName: s.exercise,
                        setNumber: 1,
                        weight: Number(s.weight),
                        reps: Number(s.reps),
                        estimatedOneRepMax: Number(s.weight) * (1 + Number(s.reps) / 30)
                    }))
                }
            }
        })
        revalidatePath("/dashboard")
        return { success: true, data: log }
    } catch (e) {
        console.error(e)
        return { success: false }
    }
}
