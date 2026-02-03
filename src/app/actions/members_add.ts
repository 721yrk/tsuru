
"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"

export async function createMember(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const joinDateStr = formData.get("joinDate") as string
    const plan = formData.get("plan") as string
    const contractedSessions = parseInt(formData.get("contractedSessions") as string)

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { success: false, error: "Email already exists" }

    try {
        // Create User & Member in transaction
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash: await hash("password", 10), // Default password
                    role: "MEMBER"
                }
            })

            const joinDate = joinDateStr ? new Date(joinDateStr) : new Date()

            await tx.member.create({
                data: {
                    userId: user.id,
                    name,
                    dateOfBirth: new Date("1990-01-01"), // Default dummy
                    gender: "OTHER",
                    phone: "000-0000-0000",
                    emergencyContact: "None",
                    joinDate: joinDate,
                    plan,
                    contractedSessions
                }
            })
        })

        revalidatePath("/dashboard/members")
        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Failed to create member" }
    }
}
