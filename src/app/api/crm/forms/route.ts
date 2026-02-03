import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { title, questions } = body

        // Create Form with nested questions
        const form = await prisma.form.create({
            data: {
                title,
                questions: {
                    create: questions.map((q: any) => ({
                        type: q.type,
                        label: q.label,
                        options: q.options, // Array of strings is handled by Prisma Json type
                        required: q.required,
                        orderIndex: q.orderIndex
                    }))
                }
            }
        })

        return NextResponse.json({ success: true, formId: form.id })
    } catch (error) {
        console.error("Error creating form:", error)
        return NextResponse.json({ success: false, error: "Failed to create form" }, { status: 500 })
    }
}
