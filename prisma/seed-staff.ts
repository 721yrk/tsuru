import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const initialStaff = [
    { name: "ゆうじ", type: "trainer", color: "#3b82f6" },
    { name: "りさ", type: "trainer", color: "#ec4899" },
    { name: "セルフルーム１", type: "self-room", color: "#10b981" },
    { name: "セルフルーム２", type: "self-room", color: "#f59e0b" }
]

async function seedStaff() {
    console.log('🌱 Seeding staff...')

    for (const staff of initialStaff) {
        const existing = await prisma.staff.findFirst({
            where: { name: staff.name }
        })

        if (!existing) {
            await prisma.staff.create({
                data: staff
            })
            console.log(`✅ Created staff: ${staff.name}`)
        } else {
            console.log(`⏭️  Staff already exists: ${staff.name}`)
        }
    }

    console.log('✨ Staff seeding complete!')
}

async function main() {
    try {
        await seedStaff()
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main()
