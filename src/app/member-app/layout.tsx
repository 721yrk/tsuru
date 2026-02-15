
import Link from 'next/link'
import { Home, Calendar, NotebookPen, User } from 'lucide-react'

export const metadata = {
    title: 'TSURU Member',
    description: 'Member Portal',
}

export default function MemberAppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Mobile Content Area */}
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
                <div className="max-w-md mx-auto flex justify-around items-center h-16">
                    <Link href="/member-app" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 focus:text-blue-600 active:text-blue-600">
                        <Home className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">ホーム</span>
                    </Link>
                    <Link href="/member-app/booking" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 focus:text-blue-600 active:text-blue-600">
                        <Calendar className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">予約</span>
                    </Link>
                    <Link href="/member-app/record" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 focus:text-blue-600 active:text-blue-600">
                        <NotebookPen className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">カルテ</span>
                    </Link>
                    <Link href="/member-app/settings" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 focus:text-blue-600 active:text-blue-600">
                        <User className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">設定</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
