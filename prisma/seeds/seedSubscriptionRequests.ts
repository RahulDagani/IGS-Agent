import { PrismaClient, SubscriptionRequestStatus } from "@prisma/client";

export async function seedSubscriptionRequests(prisma: PrismaClient) {
    console.log("Seeding subscription requests...");

    try {
        // Get tenants, plans, and admin users
        const tenants = await prisma.tech_tenants.findMany({
            take: 3,
        });

        const plans = await prisma.tech_plans.findMany({
            take: 3,
        });

        const adminUsers = await prisma.tech_users.findMany({
            where: {
                role: {
                    in: ["ADMIN", "SUPER_ADMIN"],
                },
            },
            take: 2,
        });

        if (tenants.length === 0 || plans.length === 0) {
            console.log("No tenants or plans found. Please seed them first.");
            return;
        }

        console.log(
            `Found ${tenants.length} tenants and ${plans.length} plans`
        );

        const subscriptionRequestsData = [
            {
                tenantId: tenants[0].id,
                planId: plans[0].id,
                transactionId: "TXN001234",
                documentPath: "/documents/subscription_1.pdf",
                month: "September 2025",
                status: SubscriptionRequestStatus.PENDING,
                requestedAt: new Date("2025-09-01"),
            },
            {
                tenantId: tenants[1]?.id || tenants[0].id, // Fallback to first tenant
                planId: plans[1]?.id || plans[0].id, // Fallback to first plan
                transactionId: "TXN005678",
                documentPath: "/documents/subscription_2.pdf",
                month: "October 2025",
                status: SubscriptionRequestStatus.UNDER_REVIEW,
                requestedAt: new Date("2025-09-15"),
                reviewedBy: adminUsers[0]?.id,
                reviewedAt: new Date("2025-09-16"),
                adminNotes: "Document verification in progress",
            },
            {
                tenantId: tenants[2]?.id || tenants[0].id, // Fallback to first tenant
                planId: plans[2]?.id || plans[0].id, // Fallback to first plan
                transactionId: "TXN009876",
                documentPath: "/documents/subscription_3.pdf",
                month: "November 2025",
                status: SubscriptionRequestStatus.APPROVED,
                requestedAt: new Date("2025-09-20"),
                reviewedBy: adminUsers[1]?.id || adminUsers[0]?.id,
                reviewedAt: new Date("2025-09-21"),
                adminNotes: "All documents verified and approved",
            },
        ];

        // Filter out any entries with missing required data
        const validRequestsData = subscriptionRequestsData.filter(
            (request) =>
                request.tenantId && request.planId && request.transactionId
        );

        for (const requestData of validRequestsData) {
            try {
                await prisma.tech_subscription_requests.upsert({
                    where: { transactionId: requestData.transactionId },
                    update: {},
                    create: requestData,
                });
                console.log(
                    `Subscription request ${requestData.transactionId} seeded successfully`
                );
            } catch (error) {
                console.error(
                    `Error seeding subscription request ${requestData.transactionId}:`,
                    error
                );
            }
        }

        const requestsCount = await prisma.tech_subscription_requests.count();
        console.log(
            `Subscription requests seeding completed! Total requests: ${requestsCount}`
        );

        return await prisma.tech_subscription_requests.findMany();
    } catch (error) {
        console.error("Error in seedSubscriptionRequests:", error);
        throw error;
    }
}
