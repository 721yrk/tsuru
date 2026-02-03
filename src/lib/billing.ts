
import { Member, Reservation, User } from "@prisma/client"
import { differenceInYears } from "date-fns"

// Constants
const PLAN_PRICES: Record<string, number> = {
    "STANDARD": 6600,
    "PREMIUM": 11000,
    "VIP": 50000,
}

export const TRAINER_RATES: Record<string, number> = {
    "夏井 優志": 6050,
    "夏井 莉沙": 4950,
}
const DEFAULT_TRAINER_RATE = 5000

export type MemberStage = {
    name: string
    discountRate: number // 0.0 to 1.0
    yearsRequired: number
}

const STAGES: MemberStage[] = [
    { name: "DIAMOND (10年+)", discountRate: 0.50, yearsRequired: 10 },
    { name: "PLATINUM (7年+)", discountRate: 0.30, yearsRequired: 7 },
    { name: "GOLD (5年+)", discountRate: 0.20, yearsRequired: 5 },
    { name: "SILVER (3年+)", discountRate: 0.10, yearsRequired: 3 },
    { name: "BRONZE (1年+)", discountRate: 0.05, yearsRequired: 1 },
    { name: "REGULAR (1年未満)", discountRate: 0.00, yearsRequired: 0 },
]

export function calculateMemberStage(joinDate: Date, manualDiscountRate?: number | null): MemberStage {
    if (manualDiscountRate !== undefined && manualDiscountRate !== null) {
        const rate = manualDiscountRate / 100
        return {
            name: `CUSTOM (${manualDiscountRate}%)`,
            discountRate: rate,
            yearsRequired: 0
        }
    }
    const tenureYears = differenceInYears(new Date(), joinDate)
    const stage = STAGES.find(s => tenureYears >= s.yearsRequired) || STAGES[STAGES.length - 1]
    return stage
}

export type MonthlyBill = {
    basePlanFee: number
    discountedBasePlanFee: number
    contractedSessionFee: number
    additionalSessionFee: number
    total: number
    details: {
        planName: string
        sessionCount: number
        appliedDiscountRate: number
        stageName: string
        contractedSessionCount: number
        additionalSessions: { trainerName: string; date: Date; rate: number }[]
    }
}

export function calculateMonthlyBill(
    member: Member & { mainTrainer?: User | null },
    reservations: (Reservation & { trainer: User })[]
): MonthlyBill {
    const stage = calculateMemberStage(member.joinDate, member.manualDiscountRate)

    // A: Base Plan Fee with Discount
    const basePlanFee = PLAN_PRICES[member.plan] || 0
    const discountedBasePlanFee = Math.floor(basePlanFee * (1 - stage.discountRate))

    // B: Contracted Session Fee
    // Uses Main Trainer's rate * Contracted Session Count
    const mainTrainerRate = member.mainTrainer ? (TRAINER_RATES[member.mainTrainer.name] || DEFAULT_TRAINER_RATE) : DEFAULT_TRAINER_RATE
    const contractedCount = member.contractedSessions // Default should be 4 if not set, handled by DB default
    const contractedSessionFee = mainTrainerRate * contractedCount

    // C: Additional Session Fee (Pay-as-you-go)
    let additionalSessionFee = 0
    const additionalSessions: { trainerName: string; date: Date; rate: number }[] = []

    // Sort reservations by date to determine which are "Contracted" (first N) and "Additional" (subsequent)
    const sortedReservations = [...reservations]
        .filter(r => r.status !== 'CANCELLED')
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    sortedReservations.forEach((res, index) => {
        if (index < contractedCount) {
            // Covered by Contract Fee
            return
        }

        // Additional Session: Charge actual trainer rate
        const trainerName = res.trainer.name
        const rate = TRAINER_RATES[trainerName] || DEFAULT_TRAINER_RATE
        additionalSessionFee += rate
        additionalSessions.push({ trainerName, date: res.startTime, rate })
    })

    return {
        basePlanFee,
        discountedBasePlanFee,
        contractedSessionFee,
        additionalSessionFee,
        total: discountedBasePlanFee + contractedSessionFee + additionalSessionFee,
        details: {
            planName: member.plan,
            sessionCount: sortedReservations.length,
            appliedDiscountRate: stage.discountRate,
            stageName: stage.name,
            contractedSessionCount: contractedCount,
            additionalSessions
        }
    }
}
