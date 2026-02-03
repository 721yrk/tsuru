import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { lineClient } from "@/lib/line"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { title, content, targetFilter, status } = body

        // 1. Create Broadcast Record
        const broadcast = await prisma.broadcast.create({
            data: {
                title,
                content: content,
                targetFilter: targetFilter,
                status: status === "SENDING" ? "SENT" : "DRAFT", // Immediate send for now
                scheduledAt: status === "SENDING" ? new Date() : null,
            }
        })

        // 2. Send Message if status is SENDING
        if (status === "SENDING") {
            try {
                // Determine targets
                // If ALL, use broadcast() method of LINE SDK (Careful about costs!)
                // For safety in this demo, let's use 'broadcast' method if target is ALL.

                // Note: content is stored as JSON, need to parse or use as is if it fits LINE Message type
                // content is expected to be an array of Message objects.

                await lineClient.broadcast(content as any)

                // Update sent count (Mock or fetch from LINE insight later)
                // For now, we don't know exact count easily without tracking users manually or waiting for insight API
                // Leaving sentCount as 0 or updating later.

            } catch (lineError) {
                console.error("LINE Broadcast Error:", lineError)
                // Revert status to FAILED
                await prisma.broadcast.update({
                    where: { id: broadcast.id },
                    data: { status: "FAILED" }
                })
                return NextResponse.json({ success: false, error: "Failed to send to LINE" }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, broadcastId: broadcast.id })
    } catch (error) {
        console.error("Error creating broadcast:", error)
        return NextResponse.json({ success: false, error: "Failed to create broadcast" }, { status: 500 })
    }
}
