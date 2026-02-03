'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Get all active staff
export async function getStaffList() {
    return await prisma.staff.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    })
}

// Get all members for dropdown
export async function getMembersList() {
    return await prisma.member.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            rank: true
        },
        orderBy: { name: 'asc' }
    })
}

// Get bookings for a specific date
export async function getBookingsForDate(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return await prisma.booking.findMany({
        where: {
            startTime: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                not: 'cancelled'
            }
        },
        include: {
            member: {
                select: {
                    id: true,
                    name: true,
                    rank: true
                }
            },
            staff: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        },
        orderBy: { startTime: 'asc' }
    })
}

// Create a new booking
export async function createBooking(data: {
    memberId: string
    staffId: string
    startTime: Date
    endTime: Date
    notes?: string
}) {
    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
        where: {
            staffId: data.staffId,
            status: { not: 'cancelled' },
            OR: [
                {
                    AND: [
                        { startTime: { lte: data.startTime } },
                        { endTime: { gt: data.startTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { lt: data.endTime } },
                        { endTime: { gte: data.endTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { gte: data.startTime } },
                        { endTime: { lte: data.endTime } }
                    ]
                }
            ]
        }
    })

    if (conflict) {
        throw new Error('この時間帯には既に予約が入っています')
    }

    const booking = await prisma.booking.create({
        data: {
            memberId: data.memberId,
            staffId: data.staffId,
            startTime: data.startTime,
            endTime: data.endTime,
            notes: data.notes,
            status: 'confirmed'
        },
        include: {
            member: true,
            staff: true
        }
    })

    revalidatePath('/dashboard/calendar')
    return booking
}

// Update booking
export async function updateBooking(id: string, data: {
    startTime?: Date
    endTime?: Date
    notes?: string
    status?: string
}) {
    const booking = await prisma.booking.update({
        where: { id },
        data,
        include: {
            member: true,
            staff: true
        }
    })

    revalidatePath('/dashboard/calendar')
    return booking
}

// Cancel booking
export async function cancelBooking(id: string) {
    const booking = await prisma.booking.findUnique({
        where: { id }
    })

    if (!booking) {
        throw new Error('予約が見つかりません')
    }

    // Check if cancellation is more than 24 hours before the booking
    const now = new Date()
    const hoursUntilBooking = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    // 24 hours or more before: 'cancelled' (not counted)
    // Less than 24 hours: 'cancelled_late' (counted)
    const status = hoursUntilBooking >= 24 ? 'cancelled' : 'cancelled_late'

    const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status }
    })

    revalidatePath('/dashboard/calendar')
    return { booking: updatedBooking, status }
}

// Delete booking
export async function deleteBooking(id: string) {
    await prisma.booking.delete({
        where: { id }
    })

    revalidatePath('/dashboard/calendar')
}

// Get available time slots for a specific date and staff
export async function getAvailableSlots(date: Date, staffId?: string) {
    try {
        const startOfDay = new Date(date)
        startOfDay.setHours(10, 0, 0, 0) // 10:00

        const endOfDay = new Date(date)
        endOfDay.setHours(22, 0, 0, 0) // 22:00

        // Get all active staff if staffId not specified
        const staffList = staffId
            ? await prisma.staff.findMany({ where: { id: staffId, isActive: true } })
            : await prisma.staff.findMany({ where: { isActive: true } })

        if (staffList.length === 0) {
            return { slots: [] }
        }

        // Get all bookings for the date
        const bookings = await prisma.booking.findMany({
            where: {
                startTime: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                status: { not: 'cancelled' }
            },
            select: {
                staffId: true,
                startTime: true,
                endTime: true
            }
        })

        // Generate 15-minute slots from 10:00 to 22:00
        const slots: {
            staffId: string
            staffName: string
            time: Date
            available: boolean
        }[] = []

        for (const staff of staffList) {
            const staffBookings = bookings.filter(b => b.staffId === staff.id)

            for (let hour = 10; hour < 22; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const slotTime = new Date(date)
                    slotTime.setHours(hour, minute, 0, 0)

                    // Check if this slot conflicts with any booking
                    const hasConflict = staffBookings.some(booking => {
                        return slotTime >= booking.startTime && slotTime < booking.endTime
                    })

                    slots.push({
                        staffId: staff.id,
                        staffName: staff.name,
                        time: slotTime,
                        available: !hasConflict
                    })
                }
            }
        }

        return { slots }
    } catch (error) {
        console.error('Error getting available slots:', error)
        return { error: '利用可能時間の取得に失敗しました' }
    }
}
