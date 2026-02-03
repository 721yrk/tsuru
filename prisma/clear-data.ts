
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Clearing Training Logs and Sets...')
    await prisma.trainingSet.deleteMany({})
    await prisma.trainingLog.deleteMany({})
    console.log('Training data cleared.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
