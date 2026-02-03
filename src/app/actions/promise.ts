
"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getPromises(memberId: string) {
    try {
        return await prisma.promise.findMany({
            where: { memberId },
            orderBy: { dueDate: "asc" }
        })
    } catch (error) {
        return []
    }
}

export async function togglePromiseStatus(promiseId: string) {
    try {
        const promise = await prisma.promise.findUnique({ where: { id: promiseId } })
        if (!promise) return { success: false }

        const newStatus = promise.status === "COMPLETED" ? "PENDING" : "COMPLETED"
        await prisma.promise.update({
            where: { id: promiseId },
            data: {
                status: newStatus,
                completions: newStatus === "COMPLETED" ? {
                    create: { completedDate: new Date(), note: "Done via Dashboard" }
                } : undefined
            }
        })
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        return { success: false, error: String(error) }
    }
}
