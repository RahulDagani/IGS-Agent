import { PrismaClient } from "@prisma/client";

export async function seedTenants(
    prisma: PrismaClient,
    users: any,
    plans: any
) {
    await prisma.tech_tenants.upsert({
        where: { domain: "mybiz.com" },
        update: {},
        create: {
            domain: "mybiz.com",
            name: "My Business",
            email: "contact@mybiz.com",
            planId: plans.proPlan.id,
            ownerId: users.superAdmin.id,
            verified: true,
            subscribed: true,
        },
    });

    await prisma.tech_tenants.upsert({
        where: { domain: "agentbiz.com" },
        update: {},
        create: {
            domain: "agentbiz.com",
            name: "Agent Business",
            email: "agentbiz@example.com",
            planId: plans.basicPlan.id,
            ownerId: users.agentUser.id,
        },
    });

    console.log("✅ Tenants seeded");
}
