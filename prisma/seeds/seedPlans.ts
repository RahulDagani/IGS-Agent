import { PrismaClient } from "@prisma/client";

export async function seedPlans(prisma: PrismaClient, features: any[]) {
    const basicPlan = await prisma.tech_plans.upsert({
        where: { name: "Basic Plan" },
        update: {},
        create: {
            name: "Basic Plan",
            amount: 19.99,
            description: "Perfect for small businesses",
            limitClients: 10,
            limitSuppliers: 5,
            limitEmployees: 10,
            limitDomains: 1,
            limitInvoices: 50,
            limitPurchases: 30,
            image: "basic.png",
            pricingFeatures: { connect: [{ id: features[0].id }] },
        },
    });

    const proPlan = await prisma.tech_plans.upsert({
        where: { name: "Pro Plan" },
        update: {},
        create: {
            name: "Pro Plan",
            amount: 49.99,
            description: "For growing businesses",
            limitClients: 100,
            limitSuppliers: 50,
            limitEmployees: 200,
            limitDomains: 3,
            limitInvoices: 500,
            limitPurchases: 300,
            image: "pro.png",
            pricingFeatures: {
                connect: features.map((f) => ({ id: f.id })),
            },
        },
    });

    console.log("✅ Plans seeded");
    return { basicPlan, proPlan };
}
