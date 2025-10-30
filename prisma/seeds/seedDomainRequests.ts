import { PrismaClient, DomainRequestStatus } from "@prisma/client";

export async function seedDomainRequests(prisma: PrismaClient) {
    console.log("Seeding domain requests...");

    // Get some tenants to associate with domain requests
    const tenants = await prisma.tech_tenants.findMany({
        take: 3,
        include: {
            owner: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (tenants.length === 0) {
        console.log("No tenants found. Please seed tenants first.");
        return;
    }

    const domainRequestsData = [
        {
            domain: "example.com",
            status: DomainRequestStatus.PENDING,
            tenantId: tenants[0].id,
        },
        {
            domain: "startup.io",
            status: DomainRequestStatus.CONNECTED,
            tenantId: tenants[1]?.id || tenants[0].id,
        },
        {
            domain: "business.org",
            status: DomainRequestStatus.REJECTED,
            tenantId: tenants[2]?.id || tenants[0].id,
        },
    ];

    for (const requestData of domainRequestsData) {
        try {
            await prisma.tech_domain_requests.upsert({
                where: { domain: requestData.domain },
                update: {},
                create: requestData,
            });
            console.log(
                `Domain request for ${requestData.domain} seeded successfully`
            );
        } catch (error) {
            console.error(
                `Error seeding domain request ${requestData.domain}:`,
                error
            );
        }
    }

    const requestsCount = await prisma.tech_domain_requests.count();
    console.log(
        `Domain requests seeding completed! Total requests: ${requestsCount}`
    );

    return await prisma.tech_domain_requests.findMany({
        include: {
            tenant: {
                include: {
                    owner: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}
