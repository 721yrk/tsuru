
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import Line from "next-auth/providers/line"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Line({
            clientId: process.env.LINE_CHANNEL_ID,
            clientSecret: process.env.LINE_CHANNEL_SECRET,
            profile: (profile) => {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email, // LINE email requires special permission
                    image: profile.picture,
                }
            },
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.passwordHash) return null

                const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash)

                if (isValid) return user
                return null
            }
        })
    ],
    callbacks: {
        async session({ session, user, token }) {
            if (token?.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user, account, profile }) {
            if (account?.provider === 'line' && profile?.sub) {
                // Setup logic to link lineUserId if needed, 
                // though PrismaAdapter usually handles 'Account' table.

                // If we are NOT using Account table (which we haven't seen in schema),
                // we might want to manually update user.
                // But PrismaAdapter expects Account table.
            }
            return token
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === 'line') {
                // Update lineUserId if it's not set
                if (user.email) {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { lineUserId: profile?.sub }
                    })
                }
            }
            return true
        }
    },
    session: { strategy: "jwt" }, // Use JWT for simpler session management without database sessions table requirement unless we add it
})
