'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// ===== TAGS =====

export async function createTag(name: string, color: string = "#94a3b8") {
    try {
        await prisma.tag.create({
            data: { name, color }
        })
        revalidatePath("/dashboard/crm/tags")
        revalidatePath("/dashboard/crm/members")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create tag" }
    }
}

export async function deleteTag(id: string) {
    try {
        await prisma.tag.delete({ where: { id } })
        revalidatePath("/dashboard/crm/tags")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete tag" }
    }
}

// ===== RICH MENUS =====

export async function setDefaultRichMenuForUser(userId: string, richMenuId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { currentRichMenuId: richMenuId }
        })
        revalidatePath(`/dashboard/crm/members/${userId}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to set rich menu" }
    }
}

// ===== CUSTOM ATTRIBUTES =====

export async function createCustomAttribute(key: string, label: string, type: string) {
    try {
        await prisma.customAttribute.create({
            data: { key, label, type }
        })
        revalidatePath("/dashboard/crm/attributes") // If we had this page
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create attribute" }
    }
}
