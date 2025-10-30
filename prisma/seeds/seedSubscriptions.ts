import { PrismaClient, SubscriptionStatus } from "@prisma/client";

export async function seedSubscriptions(prisma: PrismaClient) {
    console.log("Seeding subscriptions...");

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

        const subscriptionsData = [
            {
                tenantId: tenants[0].id,
                planId: plans[0].id,
                month: "September 2025",
                approvedBy: adminUsers[0]?.id,
                startsAt: new Date("2025-09-01"),
                endsAt: new Date("2025-09-30"),
                status: SubscriptionStatus.ACTIVE,
                autoRenew: true,
            },
            {
                tenantId: tenants[1]?.id || tenants[0].id, // Fallback to first tenant
                planId: plans[1]?.id || plans[0].id, // Fallback to first plan
                month: "October 2025",
                approvedBy: adminUsers[1]?.id || adminUsers[0]?.id,
                startsAt: new Date("2025-10-01"),
                endsAt: new Date("2025-10-31"),
                status: SubscriptionStatus.ACTIVE,
                autoRenew: false,
            },
            {
                tenantId: tenants[2]?.id || tenants[0].id, // Fallback to first tenant
                planId: plans[2]?.id || plans[0].id, // Fallback to first plan
                month: "November 2025",
                approvedBy: adminUsers[0]?.id,
                startsAt: new Date("2025-11-01"),
                endsAt: new Date("2025-11-30"),
                status: SubscriptionStatus.EXPIRED,
                autoRenew: true,
            },
        ];

        // Filter out any entries with missing required data
        const validSubscriptionsData = subscriptionsData.filter(
            (subscription) => subscription.tenantId && subscription.planId
        );

        for (const subscriptionData of validSubscriptionsData) {
            try {
                await prisma.tech_subscriptions.upsert({
                    where: {
                        tenantId_month: {
                            tenantId: subscriptionData.tenantId,
                            month: subscriptionData.month,
                        },
                    },
                    update: {},
                    create: subscriptionData,
                });
                console.log(
                    `Subscription for tenant ${subscriptionData.tenantId} (${subscriptionData.month}) seeded successfully`
                );
            } catch (error) {
                console.error(
                    `Error seeding subscription for tenant ${subscriptionData.tenantId}:`,
                    error
                );
            }
        }

        const subscriptionsCount = await prisma.tech_subscriptions.count();
        console.log(
            `Subscriptions seeding completed! Total subscriptions: ${subscriptionsCount}`
        );

        return await prisma.tech_subscriptions.findMany();
    } catch (error) {
        console.error("Error in seedSubscriptions:", error);
        throw error;
    }
}
