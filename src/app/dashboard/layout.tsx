"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Menu } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="h-full relative">
            {/* Sidebar */}
            <div
                className={`hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300 ${sidebarOpen ? "md:w-48" : "md:w-0"
                    }`}
            >
                {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
            </div>

            {/* Hamburger button when sidebar is closed */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="hidden md:flex fixed top-4 left-4 z-[90] p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <Menu className="h-5 w-5 text-slate-600" />
                </button>
            )}

            <main
                className={`pb-10 transition-all duration-300 ${sidebarOpen ? "md:pl-48" : "md:pl-0"
                    }`}
            >
                {children}
            </main>
        </div>
    )
}
