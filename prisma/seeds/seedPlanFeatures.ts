import { PrismaClient } from "@prisma/client";

export async function seedPlanFeatures(prisma: PrismaClient) {
    const features = ["Custom Domain", "Advanced Analytics", "24/7 Support"];
    const created = [];

    for (const name of features) {
        const feature = await prisma.tech_plan_features.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        created.push(feature);
    }

    console.log("✅ Plan features seeded");
    return created;
}
