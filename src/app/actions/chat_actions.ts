'use server'

import { prisma } from "@/lib/db"

export async function getGlobalUnreadCount() {
    try {
        const count = await prisma.chatMessage.count({
            where: {
                sender: 'USER',
                isRead: false
            }
        })
        return { count }
    } catch (error) {
        console.error('Error fetching unread count:', error)
        return { count: 0 }
    }
}

export async function markMessagesAsRead(userId: string) {
    try {
        await prisma.chatMessage.updateMany({
            where: {
                userId: userId,
                sender: 'USER',
                isRead: false
            },
            data: {
                isRead: true
            }
        })
        return { success: true }
    } catch (error) {
        console.error('Error marking messages as read:', error)
        return { success: false }
    }
}
