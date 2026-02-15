
import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/db"
import { LineLinkButton } from "@/components/settings/LineLinkButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User } from "lucide-react"

export default async function MemberSettingsPage() {
    const session = await auth()

    // Fallback or specific user fetch
    // ideally we use session.user.email
    const userEmail = session?.user?.email

    let isLineLinked = false
    let userName = "ゲスト"

    if (userEmail) {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { accounts: true }
        })
        if (user) {
            userName = user.name
            isLineLinked = !!user.lineUserId || user.accounts.some(a => a.provider === 'line')
        }
    }

    return (
        <div className="bg-[#FAFDFB] min-h-screen pb-24 p-6">
            <h1 className="text-2xl font-bold tracking-tight mb-6 text-slate-800">設定</h1>

            <div className="space-y-6">
                {/* Profile Card */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">{userName}</div>
                        <div className="text-xs text-slate-400">{userEmail}</div>
                    </div>
                </div>

                {/* Account Link Card */}
                <Card className="shadow-sm border-slate-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">アカウント連携</CardTitle>
                        <CardDescription className="text-xs">
                            LINEと連携すると、次回からLINEでかんたんにログインできます。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LineLinkButton isLinked={isLineLinked} />
                    </CardContent>
                </Card>

                {/* Logout */}
                <form
                    action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/login" })
                    }}
                >
                    <button className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition">
                        <LogOut className="w-4 h-4" />
                        ログアウト
                    </button>
                </form>
            </div>
        </div>
    )
}
