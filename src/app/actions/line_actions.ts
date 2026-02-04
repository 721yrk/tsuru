'use server'

import { prisma } from "@/lib/db"
import { sendLineMessage } from "@/lib/line"

export async function sendLineMessageToUser(userId: string, message: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user || !user.lineUserId) {
            return { error: 'LINE連携されていないユーザーです' }
        }

        const success = await sendLineMessage(user.lineUserId, message)

        if (success) {
            // Log to ChatMessage
            await prisma.chatMessage.create({
                data: {
                    userId: userId,
                    sender: 'ADMIN',
                    content: message,
                    isRead: true
                }
            })
            return { success: true, message: 'メッセージを送信しました' }
        } else {
            return { error: 'LINEメッセージの送信に失敗しました' }
        }
    } catch (error) {
        console.error('Error sending message:', error)
        return { error: '送信中にエラーが発生しました' }
    }
}
