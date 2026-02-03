import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // 1. Clean up all tables
    console.log('🗑️  Cleaning up existing data...')
    await prisma.booking.deleteMany()
    await prisma.shiftOverride.deleteMany()
    await prisma.shift.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.bodyRecord.deleteMany()
    await prisma.trainingSet.deleteMany()
    await prisma.trainingLog.deleteMany()
    await prisma.conditioningLog.deleteMany()
    await prisma.promiseCompletion.deleteMany()
    await prisma.promise.deleteMany()
    await prisma.reservation.deleteMany()
    await prisma.lifeLog.deleteMany()
    await prisma.member.deleteMany()
    await prisma.user.deleteMany()
    await prisma.masterExercise.deleteMany()

    // 2. Create Staff (for booking calendar)
    console.log('👥 Creating staff...')
    const staffYuji = await prisma.staff.create({
        data: {
            name: '夏井 優志',
            type: 'coach',
            color: '#3b82f6',
            isActive: true
        }
    })

    const staffRisa = await prisma.staff.create({
        data: {
            name: '夏井 莉沙',
            type: 'supporter',
            color: '#ec4899',
            isActive: true
        }
    })

    // 3. Create Trainers (User accounts)
    console.log('🎓 Creating trainers...')
    const pwd = await hash('password123', 12)
    const trainerYuji = await prisma.user.create({
        data: {
            email: 'yuji@clover.com',
            name: '夏井 優志',
            passwordHash: pwd,
            role: 'TRAINER',
            title: 'Wellness Coach',
            unitPrice: 6050
        }
    })

    const trainerRisa = await prisma.user.create({
        data: {
            email: 'risa@clover.com',
            name: '夏井 莉沙',
            passwordHash: pwd,
            role: 'TRAINER',
            title: 'Wellness Supporter',
            unitPrice: 4950
        }
    })

    // 4. Create Members
    console.log('🏋️  Creating members...')
    const joinDateTanaka = new Date()
    const userTanaka = await prisma.user.create({
        data: {
            email: 'tanaka@clover.com',
            name: '田中 次郎',
            passwordHash: pwd,
            role: 'MEMBER',
            memberProfile: {
                create: {
                    name: '田中 次郎',
                    dateOfBirth: new Date('1985-06-15'),
                    gender: 'MALE',
                    phone: '080-1111-2222',
                    emergencyContact: '090-9999-8888',
                    medicalHistory: '特になし',
                    goals: '健康維持・体力向上',
                    joinDate: joinDateTanaka,
                    rank: 'REGULAR',
                    plan: 'STANDARD',
                    contractedSessions: 2,
                    mainTrainerId: trainerYuji.id,
                }
            }
        }
    })

    const joinDateSuzuki = new Date()
    joinDateSuzuki.setFullYear(joinDateSuzuki.getFullYear() - 3) // 3 years ago
    const userSuzuki = await prisma.user.create({
        data: {
            email: 'suzuki@clover.com',
            name: '鈴木 健太',
            passwordHash: pwd,
            role: 'MEMBER',
            memberProfile: {
                create: {
                    name: '鈴木 健太',
                    dateOfBirth: new Date('1990-03-22'),
                    gender: 'MALE',
                    phone: '090-1234-5678',
                    emergencyContact: '090-8765-4321',
                    medicalHistory: '腰痛（軽度）',
                    exerciseHistory: 'ジム通い経験あり',
                    goals: 'ベンチプレス100kg達成',
                    purpose: '仕事のパフォーマンス向上',
                    vision: '60歳でも元気に動ける体',
                    joinDate: joinDateSuzuki,
                    rank: 'GOLD',
                    plan: 'STANDARD',
                    contractedSessions: 4,
                    mainTrainerId: trainerRisa.id,
                }
            }
        }
    })

    const memberTanaka = await prisma.member.findUnique({ where: { userId: userTanaka.id } })
    const memberSuzuki = await prisma.member.findUnique({ where: { userId: userSuzuki.id } })

    if (!memberTanaka || !memberSuzuki) {
        throw new Error('Failed to create members')
    }

    // 5. Create Exercise Master Data
    console.log('💪 Creating exercise master data...')
    const exercises = [
        { name: 'ベンチプレス', category: 'Chest' },
        { name: 'スクワット', category: 'Legs' },
        { name: 'デッドリフト', category: 'Back' },
        { name: 'ショルダープレス', category: 'Shoulders' },
        { name: 'バーベルカール', category: 'Arms' },
        { name: 'ラットプルダウン', category: 'Back' },
        { name: 'レッグプレス', category: 'Legs' },
        { name: 'プランク', category: 'Abs' },
    ]

    for (const exercise of exercises) {
        await prisma.masterExercise.create({ data: exercise })
    }

    // 6. Create Sample Booking (tomorrow 10:00-11:00)
    console.log('📅 Creating sample booking...')
    const tomorrow = addDays(new Date(), 1)
    tomorrow.setHours(10, 0, 0, 0)
    const tomorrowEnd = addDays(new Date(), 1)
    tomorrowEnd.setHours(11, 0, 0, 0)

    await prisma.booking.create({
        data: {
            memberId: memberTanaka.id,
            staffId: staffYuji.id,
            startTime: tomorrow,
            endTime: tomorrowEnd,
            status: 'confirmed',
            notes: '初回カウンセリング'
        }
    })

    // 7. Create sample training log
    console.log('🏋️‍♂️ Creating sample training log...')
    await prisma.trainingLog.create({
        data: {
            memberId: memberSuzuki.id,
            trainerId: trainerYuji.id,
            trainingDate: new Date('2026-02-01'),
            durationMinutes: 60,
            notes: '順調にトレーニング継続中',
            sets: {
                create: [
                    { exerciseName: 'ベンチプレス', setNumber: 1, weight: 80, reps: 10, restSeconds: 120 },
                    { exerciseName: 'ベンチプレス', setNumber: 2, weight: 85, reps: 8, restSeconds: 120 },
                    { exerciseName: 'スクワット', setNumber: 1, weight: 100, reps: 10, restSeconds: 90 },
                ]
            }
        }
    })

    console.log('✅ Seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log('  - Staff: 2 (夏井 優志, 夏井 莉沙)')
    console.log('  - Members: 2 (田中 次郎, 鈴木 健太)')
    console.log('  - Exercises: 8')
    console.log('  - Sample Booking: 1 (明日 10:00-11:00 田中様)')
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
