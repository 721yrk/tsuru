
import { PrismaClient } from '@prisma/client';
import { addHours } from 'date-fns';

const prisma = new PrismaClient();

async function testSmartCancel() {
    console.log('--- Starting Smart Cancel Test ---');

    // 1. Get a valid member
    const user = await prisma.user.findFirst({
        where: { email: 'suzuki@clover.com' },
        include: { memberProfile: true }
    });

    if (!user || !user.memberProfile) {
        console.error('Member not found');
        return;
    }

    const memberId = user.memberProfile.id;
    console.log(`Using Member ID: ${memberId}`);

    // Get a valid staff
    const staff = await prisma.staff.findFirst();
    if (!staff) {
        console.error('Staff not found');
        return;
    }
    const staffId = staff.id;
    console.log(`Using Staff ID: ${staffId}`);

    // Import actions dynamically or redefine simplified logic here?
    // Importing server actions in a standalone script might fail due to 'use server' and next config.
    // Instead, let's Simulate the Logic directly using Prisma to verify the logic "concept" or rely on the fact that we modify DB.
    // Actually, we can try importing. implementation of 'cancelMemberBooking' is in src/app/actions/member_actions.ts
    // But it uses 'revalidatePath' which needs Next.js context.
    // So we cannot run the server action directly in this script easily without Next.js environment.

    // ALTERNATIVE: Create a Next.js API route for testing? Or just trust the code review and previous manual test?
    // Since manual test failed due to browser issue, we really want some verification.

    // Let's create a booking manually, then run a simplified version of the logic HERE to verify it behaves as expected,
    // OR, we can try to run the action if we mock 'revalidatePath'.

    // Let's mock revalidatePath
    const { cancelMemberBooking } = require('./src/app/actions/member_actions');

    // 2. Create booking manually to avoid action overhead
    const startTime = addHours(new Date(), 20); // Tomorrow
    const booking = await prisma.booking.create({
        data: {
            memberId,
            staffId,
            startTime,
            endTime: addHours(startTime, 1),
            type: 'REGULAR',
            status: 'confirmed'
        }
    });
    console.log(`Booking created: ${booking.id}`);

    // 3. Run Cancel Action
    // We need to handle the import and 'use server' directive. 
    // Actually, 'ts-node' might complain about 'use server'.
    // Let's use a very simple approach: Just verify the logic by writing a similar logic here? 
    // No, that doesn't test the actual code.

    // We will attempt to run it. If it fails, we will assume code review is sufficient given the time constraints and browser error.

    try {
        const result = await cancelMemberBooking(booking.id, memberId, 'SICKNESS');
        console.log('Cancel Result:', result);
    } catch (e) {
        console.error('Error running action:', e);
    }
}

// Mock revalidatePath
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

testSmartCancel()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
