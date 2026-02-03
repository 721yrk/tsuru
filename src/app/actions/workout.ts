
"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getExerciseHistory(memberId: string, exerciseName: string) {
    try {
        const logs = await prisma.trainingSet.findMany({
            where: {
                trainingLog: { memberId },
                exerciseName
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                createdAt: true,
                weight: true,
                reps: true,
                restSeconds: true,
                notes: true
            }
        })
        return logs.map(l => ({
            date: l.createdAt.toISOString(),
            displayDate: l.createdAt.toLocaleDateString('ja-JP'),
            weight: l.weight,
            reps: l.reps,
            restSeconds: l.restSeconds,
            notes: l.notes,
            volume: l.weight * l.reps
        }))
    } catch (e) {
        console.error("Failed to fetch history:", e)
        return []
    }
}

export async function saveWorkoutLog(
    memberId: string,
    trainerId: string | null,
    sets: { exerciseName: string, weight: number, reps: number, setNumber: number, notes?: string, restSeconds?: number }[],
    dateStr?: string // "YYYY-MM-DD"
) {
    console.log("Saving workout log...", { memberId, setsCount: sets.length, dateStr })

    if (!sets.length) return { success: false, error: "No sets provided" }

    try {
        const summary = sets.map(s => `${s.exerciseName} ${s.weight}kg`).join(", ")

        // Ensure date is parsed correctly from YYYY-MM-DD
        const trainingDate = dateStr ? new Date(dateStr) : new Date()

        const log = await prisma.trainingLog.create({
            data: {
                memberId,
                trainerId,
                trainingDate: trainingDate,
                durationMinutes: 60,
                notes: `Workout Log (${trainingDate.toLocaleDateString()}): ${summary.slice(0, 100)}...`,
                createdAt: trainingDate,
                sets: {
                    create: sets.map(s => ({
                        exerciseName: s.exerciseName,
                        weight: s.weight,
                        reps: s.reps,
                        setNumber: s.setNumber,
                        notes: s.notes,
                        restSeconds: s.restSeconds,
                        createdAt: trainingDate
                    }))
                }
            }
        })

        console.log("Workout saved successfully:", log.id)
        revalidatePath("/dashboard/members")

        return { success: true, logId: log.id }
    } catch (e: any) {
        console.error("Failed to save workout:", e)
        return { success: false, error: e.message || "Database Error" }
    }
}

export async function getLastLog(memberId: string, exerciseName: string) {
    try {
        const lastSet = await prisma.trainingSet.findFirst({
            where: {
                trainingLog: { memberId: memberId },
                exerciseName: exerciseName
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!lastSet) return null
        return { weight: lastSet.weight, reps: lastSet.reps, date: lastSet.createdAt }
    } catch (e) {
        return null
    }
}
