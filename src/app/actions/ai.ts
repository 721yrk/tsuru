
"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function processSessionRecording(memberId: string, trainerId: string, durationSeconds: number) {
    // Simulate AI processing delay is handled in UI, this just returns the result
    const mockTranscript = `
Trainer: How is your lower back today?
Member: It feels better, no pain during the week.
Trainer: Great. Let's start with deadlifts. Keep the bar close to your shins.
Member: Like this?
Trainer: Perfect. Chin down. Drive through your heels.
Member: (Groans) Heavy today.
Trainer: You got this. 3 more reps. Good set.
Member: Phew.
Trainer: Rest for 2 minutes. We'll do 3 sets of 5 reps at 100kg.
    `

    const mockSummary = `
• Member reported no lower back pain (improvement).
• Deadlift form focus: Bar path and neck alignment.
• Completed 3 sets of 5 reps at 100kg.
• Member perceived exertion: High (Heavy).
    `

    // Create Training Log
    const log = await prisma.trainingLog.create({
        data: {
            memberId,
            trainerId,
            trainingDate: new Date(),
            durationMinutes: Math.ceil(durationSeconds / 60),
            notes: 'AI Automated Entry',
            transcript: mockTranscript.trim(),
            aiSummary: mockSummary.trim(),
            sets: {
                create: [
                    { exerciseName: 'Deadlift', setNumber: 1, weight: 100, reps: 5 },
                    { exerciseName: 'Deadlift', setNumber: 2, weight: 100, reps: 5 },
                    { exerciseName: 'Deadlift', setNumber: 3, weight: 100, reps: 5 },
                ]
            }
        }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/ai-record')

    return { success: true, logId: log.id, summary: mockSummary }
}
