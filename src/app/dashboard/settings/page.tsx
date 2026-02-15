
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Building2, Users } from "lucide-react"
import { StaffEditModal } from "@/components/settings/StaffEditModal"
import { ExerciseManager } from "@/components/settings/ExerciseManager"
import { PlanSettings } from "@/components/settings/PlanSettings"
import { ServiceMenuManager } from "@/components/settings/ServiceMenuManager" // NEW
import { ShiftManager } from "@/components/settings/ShiftManager" // NEW

export const dynamic = "force-dynamic"
import { LineLinkButton } from "@/components/settings/LineLinkButton"
import { auth } from "@/auth"

export default async function SettingsPage() {
    // Fetch generic users (trainers)
    // TypeScript might be complaining if Client isn't regenerated, but assuming role exists.
    // If 'role' does not exist on where, utilize 'findMany' without where or fix type?
    // It exists in schema.
    const users = await prisma.user.findMany({
        where: { role: 'TRAINER' },
        orderBy: { createdAt: 'asc' }
    })

    // Fetch Service Menus
    const serviceMenus = await prisma.serviceMenu.findMany({
        orderBy: { createdAt: 'desc' }
    })

    // Fetch Staff for Shifts (We need to query the 'Staff' model separate from 'User' model now)
    // Or did we link them? Currently 'Staff' is a separate model in the schema designed for Booking System
    // User role='TRAINER' is for authentication. Staff model is for Booking.
    // Ideally they should synced. For now, let's fetch from 'Staff' model if it exists, or create one if empty?
    // Wait, the schema has `Staff` model separate from `User`. 
    // We should probably use `Staff` model for the ShiftManager.

    // Check if Staff exist, if not create from Trainers? 
    // For this MVP step, let's just fetch Staff.
    const bookingStaff = await prisma.staff.findMany({
        include: { shifts: true }
    })

    // Map for ShiftManager
    const staffListForShifts = bookingStaff.map(s => ({
        id: s.id,
        name: s.name,
        maxConcurrentBookings: s.maxConcurrentBookings
    }))

    const shiftsMap: Record<string, any[]> = {}
    bookingStaff.forEach(s => {
        shiftsMap[s.id] = s.shifts
    })

    // Fetch Master Exercises
    const masterExercises = await prisma.masterExercise.findMany({
        orderBy: { category: 'asc' }
    })

    // Convert to compatible shape if needed, or just use as is in UI
    const staffList = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        title: u.title || "Trainer",
        unitPrice: u.unitPrice || 0
    }))

    const session = await auth()
    // Check if current user has LINE linked (by lineUserId or existing Account)
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' },
        include: { accounts: true }
    })
    const isLineLinked = !!currentUser?.lineUserId || currentUser?.accounts.some(a => a.provider === 'line')

    return (
        <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">設定</h1>
                <p className="text-neutral-500">店舗情報やプランの管理を行います。</p>
            </div>

            <Tabs defaultValue="store" className="w-full">
                <TabsList className="grid w-full grid-cols-6 md:w-[900px]">
                    <TabsTrigger value="store">店舗情報</TabsTrigger>
                    <TabsTrigger value="staff">スタッフ</TabsTrigger>
                    <TabsTrigger value="menus">予約メニュー</TabsTrigger>
                    <TabsTrigger value="shifts">シフト設定</TabsTrigger>
                    <TabsTrigger value="exercises">種目管理</TabsTrigger>
                    <TabsTrigger value="plans">プラン</TabsTrigger>
                </TabsList>

                <TabsContent value="store" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                店舗基本情報
                            </CardTitle>
                            <CardDescription>
                                アプリごとの表示名や基本設定を行います。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">店舗名（アプリ表示名）</Label>
                                <Input id="name" defaultValue="TSURU Wellness" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">代表電話番号</Label>
                                <Input id="phone" defaultValue="092-XXX-XXXX" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="address">住所</Label>
                                <Input id="address" defaultValue="福岡県福岡市南区玉川町6-5西島ビル101" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="owner">代表者</Label>
                                <Input id="owner" defaultValue="夏井 優志" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="ml-auto"><Save className="mr-2 h-4 w-4" /> 保存</Button>
                        </CardFooter>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>LINE連携</CardTitle>
                            <CardDescription>
                                あなた個人のLINEアカウントと連携すると、LINEでログインできるようになります。
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineLinkButton isLinked={isLineLinked} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                スタッフアカウント管理
                            </CardTitle>
                            <CardDescription>
                                スタッフのアカウントを追加・編集します。
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {staffList.map(staff => (
                                    <div key={staff.email} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                                        <div>
                                            <div className="font-bold">{staff.name}</div>
                                            <div className="text-sm text-neutral-500">{staff.email}</div>
                                            <div className="text-xs text-indigo-600 mt-1 font-medium">{staff.title} / ¥{staff.unitPrice.toLocaleString()}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* @ts-ignore */}
                                            <StaffEditModal staff={staff} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline">+ スタッフを追加</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="menus" className="mt-6">
                    <ServiceMenuManager initialMenus={serviceMenus} />
                </TabsContent>

                <TabsContent value="shifts" className="mt-6">
                    <ShiftManager
                        staffList={staffListForShifts}
                        initialShifts={shiftsMap}
                    />
                </TabsContent>

                <TabsContent value="exercises" className="mt-6">
                    <ExerciseManager exercises={masterExercises} />
                </TabsContent>

                <TabsContent value="plans" className="mt-6">
                    <PlanSettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}
