
"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateStaff(formData: FormData) {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const title = formData.get("title") as string
    const unitPrice = parseInt(formData.get("unitPrice") as string)

    await prisma.user.update({
        where: { id },
        data: { name, email, title, unitPrice }
    })

    revalidatePath("/dashboard/settings")
    return { success: true }
}
