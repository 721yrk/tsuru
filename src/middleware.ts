import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Define paths that require authentication
const protectedPaths = ["/dashboard", "/member-app"]

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

    const isProtected = protectedPaths.some((path) => nextUrl.pathname.startsWith(path))

    if (isProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
