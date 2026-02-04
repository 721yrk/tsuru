
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting LINE Integration Test...')

    // 1. Simulate Follow Webhook
    const dummyLineId = `TEST_LINE_USER_${Math.random().toString(36).substring(7)}`
    console.log(`\n1. Simulating Follow Event for ${dummyLineId}...`)

    // We can't call the webhook endpoint directly easily from here without running server,
    // so we will simulate the LOGIC that the webhook performs.
    // (Ideally we would fetch localhost:3000/api/webhooks/line, but let's test the db logic directly first)

    // Mock Profile from LINE
    const profile = {
        displayName: 'LINE Test User (太郎)',
        pictureUrl: 'https://example.com/avatar.png'
    }

    // Upsert Logic (Same as in route.ts)
    const user = await prisma.user.upsert({
        where: { lineUserId: dummyLineId },
        update: {
            name: profile.displayName,
            lineDisplayName: profile.displayName,
            linePictureUrl: profile.pictureUrl,
            isLineFriend: true
        },
        create: {
            lineUserId: dummyLineId,
            name: profile.displayName,
            lineDisplayName: profile.displayName,
            linePictureUrl: profile.pictureUrl,
            isLineFriend: true,
            email: `line_${dummyLineId}@sheeka.local`,
            passwordHash: 'dummy',
            role: 'MEMBER',
            memberProfile: {
                create: {
                    name: profile.displayName,
                    dateOfBirth: new Date(),
                    gender: 'UNKNOWN',
                    phone: '',
                    emergencyContact: ''
                }
            }
        },
        include: { memberProfile: true }
    })

    console.log('✅ User Created/Updated:', user.id, user.name)
    console.log('   LINE Display Name:', user.lineDisplayName)
    console.log('   Is Friend:', user.isLineFriend)

    if (user.lineDisplayName !== profile.displayName) throw new Error('DisplayName mismatch')
    if (!user.isLineFriend) throw new Error('isLineFriend should be true')

    // 2. Simulate Unfollow
    console.log(`\n2. Simulating Unfollow Event...`)
    await prisma.user.update({
        where: { lineUserId: dummyLineId },
        data: { isLineFriend: false }
    })

    const unfollowedUser = await prisma.user.findUnique({ where: { id: user.id } })
    console.log('✅ User Status:', unfollowedUser?.isLineFriend)
    if (unfollowedUser?.isLineFriend) throw new Error('isLineFriend should be false after unfollow')

    // 3. Simulate Re-Follow
    console.log(`\n3. Simulating Re-Follow...`)
    await prisma.user.update({
        where: { lineUserId: dummyLineId },
        data: { isLineFriend: true }
    })

    // 4. Test Message Sending Action (Mock)
    console.log(`\n4. Testing Message Logic (Mock)...`)
    // We can't actually send to LINE API with dummy ID, but we can verify our Action logic if we mock the lineClient.
    // Since we can't easily mock imports in this script, we will just verify the DB logging part manually.

    const messageContent = "Hello from Test Script"
    await prisma.chatMessage.create({
        data: {
            userId: user.id,
            sender: 'ADMIN',
            content: messageContent,
            isRead: true
        }
    })
    console.log('✅ ChatMessage logged successfully.')

    console.log('\n🎉 All Tests Passed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
