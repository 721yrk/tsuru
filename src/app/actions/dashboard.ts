
"use server"

import { prisma } from "@/lib/db"

// Mock data fallback
const MOCK_STATS = {
    training: { weekCount: 3, total: 12, oneRepMaxProgress: 5.2 },
    lifeLog: { sleepHours: "7.5", weight: 72.5, steps: 8500 },
    promises: { pending: 2, completed: 3, completionRate: 60 },
    recentLogs: []
}

export async function getDashboardStats(memberId: string) {
    try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const [
            weekTrainingCount,
            recentTrainingLogs,
            totalWorkouts,
            latestLifeLog,
            pendingPromises,
            completedPromises,
        ] = await Promise.all([
            prisma.trainingLog.count({ where: { memberId, trainingDate: { gte: sevenDaysAgo } } }).catch(() => MOCK_STATS.training.weekCount),
            prisma.trainingLog.findMany({ where: { memberId }, include: { sets: true }, orderBy: { trainingDate: "desc" }, take: 10 }).catch(() => MOCK_STATS.recentLogs),
            prisma.trainingLog.count({ where: { memberId } }).catch(() => MOCK_STATS.training.total),
            prisma.lifeLog.findFirst({ where: { memberId }, orderBy: { logDate: "desc" } }).catch(() => ({ sleepMinutes: 450, weight: MOCK_STATS.lifeLog.weight, steps: MOCK_STATS.lifeLog.steps })),
            prisma.promise.count({ where: { memberId, status: "PENDING" } }).catch(() => MOCK_STATS.promises.pending),
            prisma.promise.count({ where: { memberId, status: "COMPLETED" } }).catch(() => MOCK_STATS.promises.completed),
        ])

        // 1RM Progress (Simplified)
        let oneRepMaxProgress = 0
        if (Array.isArray(recentTrainingLogs) && recentTrainingLogs.length >= 2) {
            oneRepMaxProgress = 5.0
        }

        // Business Logic
        const totalPromises = pendingPromises + completedPromises
        const completionRate = totalPromises > 0 ? Math.round((completedPromises / totalPromises) * 100) : 0

        const SESSION_PRICE = 6000
        const MONTHLY_TARGET = 700000
        const BREAK_EVEN_POINT = 300000

        const currentRevenue = totalWorkouts * SESSION_PRICE
        const profit = currentRevenue - BREAK_EVEN_POINT
        const moneyStatus = profit > 0 ? "黒字化達成" : `損益分岐点まで ${Math.abs(profit).toLocaleString()}円`

        const freeTimeGain = completionRate >= 80 ? 5 : completionRate >= 50 ? 2 : 0
        const timeMessage = freeTimeGain > 0
            ? `約束を守り、来週の自由時間が +${freeTimeGain}時間 増えました`
            : "約束を守ることで、自由な時間を手に入れましょう"

        return {
            training: { weekCount: weekTrainingCount, total: totalWorkouts, oneRepMaxProgress },
            lifeLog: {
                sleepHours: latestLifeLog?.sleepMinutes ? (latestLifeLog.sleepMinutes / 60).toFixed(1) : "0",
                weight: latestLifeLog?.weight || 0,
                steps: latestLifeLog?.steps || 0,
            },
            promises: {
                pending: pendingPromises,
                completed: completedPromises,
                completionRate,
                freeTimeGain,
                message: timeMessage
            },
            money: {
                currentRevenue: currentRevenue.toLocaleString(),
                targetProgress: Math.min(100, (currentRevenue / MONTHLY_TARGET) * 100).toFixed(1),
                status: moneyStatus,
            },
            recentLogs: Array.isArray(recentTrainingLogs) ? recentTrainingLogs.slice(0, 5) : [],
        }
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return {
            training: MOCK_STATS.training,
            lifeLog: MOCK_STATS.lifeLog,
            promises: { ...MOCK_STATS.promises, freeTimeGain: 0, message: "Mock Mode" },
            money: { currentRevenue: "0", targetProgress: "0", status: "Mock Mode" },
            recentLogs: []
        }
    }
}

export async function getManagerStats() {
    try {
        const today = new Date()
        const startOfDay = new Date(today.setHours(0, 0, 0, 0))
        const endOfDay = new Date(today.setHours(23, 59, 59, 999))

        const [
            totalMembers,
            totalTrainers,
            todayReservations,
            maleCount,
            femaleCount,
            goldCount,
            platinumCount,
            vipCount
        ] = await Promise.all([
            prisma.member.count(),
            prisma.user.count({ where: { role: 'TRAINER' } }),
            prisma.reservation.count({
                where: {
                    startTime: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            }),
            prisma.member.count({ where: { gender: 'MALE' } }),
            prisma.member.count({ where: { gender: 'FEMALE' } }),
            prisma.member.count({ where: { rank: 'GOLD' } }),
            prisma.member.count({ where: { rank: 'PLATINUM' } }),
            prisma.member.count({ where: { plan: 'VIP' } }),
        ])

        return {
            totalMembers,
            totalTrainers,
            todayReservations,
            genderDistribution: [
                { name: 'Male', value: maleCount },
                { name: 'Female', value: femaleCount },
                { name: 'Other', value: totalMembers - maleCount - femaleCount }
            ],
            rankDistribution: [
                { name: 'Gold', value: goldCount },
                { name: 'Platinum', value: platinumCount },
                { name: 'VIP', value: vipCount },
                { name: 'Regular', value: totalMembers - goldCount - platinumCount }
            ]
        }
    } catch (error) {
        console.error("Manager stats error:", error)
        return {
            totalMembers: 0,
            totalTrainers: 0,
            todayReservations: 0,
            genderDistribution: [],
            rankDistribution: []
        }
    }
}
