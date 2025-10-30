import { PrismaClient } from "@prisma/client";

export async function seedDomains(prisma: PrismaClient) {
    console.log("Seeding domains...");

    // Get some tenants to associate with domains
    const tenants = await prisma.tech_tenants.findMany({
        take: 3,
    });

    if (tenants.length === 0) {
        console.log("No tenants found. Please seed tenants first.");
        return;
    }

    const domainsData = [
        {
            domain: "example.com",
            tenantId: tenants[0].id,
            isActive: true,
            isPrimary: true,
            verified: true,
        },
        {
            domain: "startup.io",
            tenantId: tenants[1]?.id || tenants[0].id,
            isActive: true,
            isPrimary: true,
            verified: true,
        },
        {
            domain: "business.org",
            tenantId: tenants[2]?.id || tenants[0].id,
            isActive: true,
            isPrimary: true,
            verified: true,
        },
    ];

    for (const domainData of domainsData) {
        try {
            await prisma.tech_domains.upsert({
                where: { domain: domainData.domain },
                update: {},
                create: domainData,
            });
            console.log(`Domain ${domainData.domain} seeded successfully`);
        } catch (error) {
            console.error(`Error seeding domain ${domainData.domain}:`, error);
        }
    }

    const domainsCount = await prisma.tech_domains.count();
    console.log(`Domains seeding completed! Total domains: ${domainsCount}`);

    return await prisma.tech_domains.findMany();
}
