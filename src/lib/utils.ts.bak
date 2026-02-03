
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Logic: Determine Rank based on Join Date
export function calculateRank(joinDate: Date) {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - joinDate.getTime())
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)

    if (diffYears >= 10) return { name: "DIAMOND", discount: 50, color: "text-blue-600" }
    if (diffYears >= 7) return { name: "PLATINUM", discount: 30, color: "text-slate-800" }
    if (diffYears >= 5) return { name: "GOLD", discount: 20, color: "text-yellow-600" }
    if (diffYears >= 3) return { name: "SILVER", discount: 10, color: "text-slate-400" }
    if (diffYears >= 1) return { name: "BRONZE", discount: 5, color: "text-amber-700" }

    return { name: "REGULAR", discount: 0, color: "text-slate-500" }
}
