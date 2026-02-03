"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { MessageCircle } from "lucide-react"

export function LineLinkButton({ isLinked }: { isLinked?: boolean }) {
    if (isLinked) {
        return (
            <Button disabled variant="outline" className="border-green-500 text-green-600 bg-green-50">
                <MessageCircle className="mr-2 h-4 w-4" />
                LINE連携済み
            </Button>
        )
    }

    return (
        <Button
            onClick={() => signIn('line', { callbackUrl: '/dashboard/settings' })}
            className="bg-[#00B900] hover:bg-[#009900] text-white"
        >
            <MessageCircle className="mr-2 h-4 w-4" />
            自分のLINEと連携する
        </Button>
    )
}
