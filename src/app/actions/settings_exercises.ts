
"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addMasterExercise(data: FormData) {
    const name = data.get("name") as string
    const category = data.get("category") as string

    if (!name || !category) return { success: false, error: "Name and Category required" }

    try {
        await prisma.masterExercise.create({
            data: { name, category }
        })
        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (e) {
        return { success: false, error: "Exercise already exists" }
    }
}

export async function deleteMasterExercise(id: string) {
    await prisma.masterExercise.delete({ where: { id } })
    revalidatePath("/dashboard/settings")
    return { success: true }
}

export async function getMasterExercises() {
    return await prisma.masterExercise.findMany({
        orderBy: { category: 'asc' }
    })
}
