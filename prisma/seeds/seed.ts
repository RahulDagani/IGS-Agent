import { PrismaClient } from "@prisma/client";
import { seedPlanFeatures } from "./seedPlanFeatures";
import { seedPlans } from "./seedPlans";
import { seedUsers } from "./seedUsers";
import { seedTenants } from "./seedTenants";
import { seedPayments } from "./seedPayments";
import { seedDomainRequests } from "./seedDomainRequests";
import { seedDomains } from "./seedDomains";
import { seedSubscriptionRequests } from "./seedSubscriptionRequests";
import { seedSubscriptions } from "./seedSubscriptions";
import { seedNewsletterSubscribers } from "./seedNewsletterSubscribers";
import { seedNewsletterCampaigns } from "./seedNewsletterCampaigns";
import { seedPages } from "./seedPages";
import { seedWebsiteSectionsWithElements } from "./seedWebsiteSectionsWithElements";
import { seedActivityLogs } from "./seedActivityLogs";
import { seedGeneralSettings } from "./seedGeneralSettings";
import { seedCurrencies } from "./seedCurrencies";
import { seedPaymentSettings } from "./seedPaymentSettings";
import { seedPermissions } from "./seedPermissions";
import { seedRoles } from "./seedRoles";
import { seedRolePermissions } from "./seedRolePermissions";

const prisma = new PrismaClient();

async function main() {
    const features = await seedPlanFeatures(prisma);
    const plans = await seedPlans(prisma, features);
    const users = await seedUsers(prisma);
    await seedPermissions(prisma);
    await seedRoles(prisma);
    await seedRolePermissions(prisma);

    await seedGeneralSettings(prisma);

    await seedCurrencies(prisma);

    await seedPaymentSettings(prisma);
    await seedTenants(prisma, users, plans);
    await seedPayments(prisma);
    await seedDomainRequests(prisma);
    await seedDomains(prisma);
    await seedSubscriptionRequests(prisma);
    await seedSubscriptions(prisma);
    await seedPages(prisma);
    // await seedWebsiteSectionsWithElements(prisma); // Having issue, better dont seed
    await seedNewsletterSubscribers(prisma);
    await seedNewsletterCampaigns(prisma);
    await seedActivityLogs(prisma);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
