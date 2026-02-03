
import DashboardClient from "@/components/dashboard/DashboardClient"

export default function DashboardPage() {
    // In the future, fetch real data here using Prisma and pass to client component
    // const memberCount = await prisma.member.count()
    // ...

    return <DashboardClient />
}
