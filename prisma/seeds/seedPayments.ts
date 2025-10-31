import { PrismaClient, PaymentStatus } from "@prisma/client";

export async function seedPayments(prisma: PrismaClient) {
    console.log("Seeding payments...");

    // Get some tenants and plans to associate with payments
    const tenants = await prisma.tech_tenants.findMany({
        take: 3,
    });

    const plans = await prisma.tech_plans.findMany({
        take: 3,
    });

    if (tenants.length === 0 || plans.length === 0) {
        console.log("No tenants or plans found. Please seed them first.");
        return;
    }

    console.log(`Found ${tenants.length} tenants and ${plans.length} plans`);

    const paymentsData = [
        {
            tenantId: tenants[0].id,
            planId: plans[0].id,
            month: "September 2025",
            transactionType: "Credit Card",
            trxId: "TRX123456",
            amount: 3499,
            paymentStatus: PaymentStatus.PAID,
            createdAt: new Date("2025-09-15"),
        },
        {
            tenantId: tenants[1]?.id || tenants[0].id,
            planId: plans[1]?.id || plans[0].id,
            month: "September 2025",
            transactionType: "PayPal",
            trxId: "TRX987654",
            amount: 8199,
            paymentStatus: PaymentStatus.PENDING,
            createdAt: new Date("2025-09-18"),
        },
        {
            tenantId: tenants[2]?.id || tenants[0].id,
            planId: plans[2]?.id || plans[0].id,
            month: "August 2025",
            transactionType: "Bank Transfer",
            trxId: "TRX567890",
            amount: 81299,
            paymentStatus: PaymentStatus.FAILED,
            createdAt: new Date("2025-08-25"),
        },
    ];

    // Filter out any undefined data
    const validPaymentsData = paymentsData.filter(
        (payment) => payment.tenantId && payment.planId
    );

    for (const paymentData of validPaymentsData) {
        try {
            await prisma.tech_payments.upsert({
                where: { trxId: paymentData.trxId },
                update: {},
                create: paymentData,
            });
            console.log(`Payment ${paymentData.trxId} seeded successfully`);
        } catch (error) {
            console.error(`Error seeding payment ${paymentData.trxId}:`, error);
        }
    }

    const paymentsCount = await prisma.tech_payments.count();
    console.log(`Payments seeding completed! Total payments: ${paymentsCount}`);

    return await prisma.tech_payments.findMany();
}
