"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// ===== SERVICE MENUS =====

export async function getServiceMenus() {
    return await prisma.serviceMenu.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function createServiceMenu(data: { name: string; duration: number; price: number; description?: string }) {
    await prisma.serviceMenu.create({
        data: {
            name: data.name,
            duration: data.duration,
            price: data.price,
            description: data.description,
            isActive: true
        }
    })
    revalidatePath('/dashboard/settings')
}

export async function updateServiceMenu(id: string, data: { name?: string; duration?: number; price?: number; description?: string; isActive?: boolean }) {
    await prisma.serviceMenu.update({
        where: { id },
        data
    })
    revalidatePath('/dashboard/settings')
}

export async function deleteServiceMenu(id: string) {
    await prisma.serviceMenu.delete({
        where: { id }
    })
    revalidatePath('/dashboard/settings')
}

// ===== SHIFTS =====

export async function getStaffShifts(staffId: string) {
    return await prisma.shift.findMany({
        where: { staffId },
        orderBy: { dayOfWeek: 'asc' }
    })
}

export async function updateStaffShifts(staffId: string, shifts: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]) {
    // Transaction to update all shifts for a staff
    await prisma.$transaction(async (tx) => {
        // Delete existing shifts (simple approach for MVP)
        await tx.shift.deleteMany({
            where: { staffId }
        })

        // Create new shifts
        await tx.shift.createMany({
            data: shifts.map(s => ({
                staffId,
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                isActive: s.isActive
            }))
        })
    })
    revalidatePath('/dashboard/settings')
}

export async function updateStaffConcurrentLimit(staffId: string, limit: number) {
    await prisma.staff.update({
        where: { id: staffId },
        data: { maxConcurrentBookings: limit }
    })
    revalidatePath('/dashboard/settings')
}
