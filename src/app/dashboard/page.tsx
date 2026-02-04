
import DashboardClient from "@/components/dashboard/DashboardClient"

import DashboardClient from "@/components/dashboard/DashboardClient"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    // 1. Fetch Summary Counts
    const totalMembers = await prisma.member.count({ where: { isActive: true } })
    const totalTrainers = await prisma.staff.count({ where: { isActive: true } })

    // Today's Bookings
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    const todayBookings = await prisma.booking.count({
        where: {
            startTime: { gte: todayStart, lte: todayEnd },
            status: { not: 'cancelled' }
        }
    })

    // 2. Gender Distribution
    const males = await prisma.member.count({ where: { gender: 'MALE', isActive: true } })
    const females = await prisma.member.count({ where: { gender: 'FEMALE', isActive: true } })
    const others = await prisma.member.count({ where: { gender: { notIn: ['MALE', 'FEMALE'] }, isActive: true } })

    // 3. Rank (Plan) Distribution
    // We Group by Plan (Need advanced query or simple count for fixed types)
    // Prisma GroupBy is distinct. 
    const ranks = await prisma.member.groupBy({
        by: ['rank'],
        _count: { rank: true },
        where: { isActive: true }
    })
    // Map Ranks to colors and labels
    const rankColors: Record<string, string> = {
        'PLATINUM': '#8b5cf6', // violet
        'GOLD': '#f59e0b', // amber
        'SILVER': '#94a3b8', // slate
        'REGULAR': '#10b981', // emerald
        'BRONZE': '#d97706'
    }
    const rankData = ranks.map(r => ({
        name: r.rank,
        value: r._count.rank,
        color: rankColors[r.rank] || '#cbd5e1'
    }))

    // 4. Sales Estimate (Approximation)
    // Standard ~ 11,000, Platinum ~ 22,000 (Just estimates for dashboard demo)
    // Or fetch Plan count?
    const standardCount = await prisma.member.count({ where: { plan: 'STANDARD', isActive: true } })
    const premiumCount = await prisma.member.count({ where: { plan: 'PREMIUM', isActive: true } })

    // Rough Calculation
    const estimatedSales = (standardCount * 11000) + (premiumCount * 22000)

    const dashboardData = {
        summary: {
            totalMembers,
            totalTrainers,
            todayBookings,
            monthlySalesForecast: estimatedSales
        },
        contractData: rankData, // Use Rank as Contract/Plan breakdown
        genderData: [
            { name: '男性', value: males, color: '#3b82f6' },
            { name: '女性', value: females, color: '#ec4899' },
            { name: 'その他', value: others, color: '#94a3b8' }
        ],
        rankData // Same
    }

    return <DashboardClient data={dashboardData} />
}
