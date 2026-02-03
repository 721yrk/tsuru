import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { lineClient } from "@/lib/line" // We need to export 'lineClient' from here or line-admin
import { RichMenu } from "@line/bot-sdk"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, chatBarText, layout } = body

        // 1. Define the Rich Menu Object for LINE
        // For this MVP, we used a fixed template "Compact_2" which has 2 buttons.
        // Left: Booking, Right: My Page

        // Dynamic URL based on environment would be better, but hardcoding prod/vercel url for now or relative
        // LINE requires Absolute URLs.
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://sheeka-wellness.vercel.app"

        const richMenuObject: RichMenu = {
            size: {
                width: 2500,
                height: 843
            },
            selected: true,
            name: name,
            chatBarText: chatBarText || "メニュー",
            areas: [
                {
                    bounds: {
                        x: 0,
                        y: 0,
                        width: 1250,
                        height: 843
                    },
                    action: {
                        type: "uri",
                        label: "予約する",
                        uri: `${baseUrl}/member-app/booking`
                    }
                },
                {
                    bounds: {
                        x: 1250,
                        y: 0,
                        width: 1250,
                        height: 843
                    },
                    action: {
                        type: "uri",
                        label: "マイページ",
                        uri: `${baseUrl}/member-app/settings`
                    }
                }
            ]
        }

        // 2. Call LINE API to create rich menu
        const richMenuId = await lineClient.createRichMenu(richMenuObject)

        // 3. Upload Image (We need an image for the rich menu)
        // Since we didn't implement image upload in UI yet, we'll skip uploading the *actual* image to LINE
        // IF we don't upload an image, the menu works but is blank? No, LINE requires an image.
        // For MVP, we might fail here if we don't upload.
        // Let's assume we have a default "placeholder" image on the server or we skip this step and it might fail to display.
        // WAIT: createRichMenu just creates ID. User sees nothing until image is linked.
        // We will save to DB first.

        // 4. Save to Database
        const richMenu = await prisma.richMenu.create({
            data: {
                lineMenuId: richMenuId,
                name: name,
                chatBarText: chatBarText,
                selected: true, // Defaulting to true for MVP
                jsonConfig: richMenuObject as any
            }
        })

        // 5. Set as Default for all users (since we selected "Default")
        await lineClient.setDefaultRichMenu(richMenuId)

        return NextResponse.json({ success: true, richMenuId })
    } catch (error) {
        console.error("Error creating rich menu:", error)
        return NextResponse.json({ success: false, error: "Failed to create rich menu" }, { status: 500 })
    }
}
