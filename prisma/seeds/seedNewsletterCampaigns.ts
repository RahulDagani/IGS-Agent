import { PrismaClient, CampaignStatus, CampaignAudience } from "@prisma/client";

export async function seedNewsletterCampaigns(prisma: PrismaClient) {
    console.log("Seeding newsletter campaigns...");

    // Get admin users and subscribers
    const adminUsers = await prisma.tech_users.findMany({
        where: {
            role: {
                in: ["ADMIN", "SUPER_ADMIN"],
            },
        },
        take: 1,
    });

    const subscribers = await prisma.tech_newsletter_subscribers.findMany({
        take: 3,
    });

    if (adminUsers.length === 0) {
        console.log("No admin users found. Please seed users first.");
        return;
    }

    const campaignsData = [
        {
            subject: "Welcome to Our Platform!",
            sentTo: CampaignAudience.ALL_SUBSCRIBERS,
            greeting: "Dear Subscriber,",
            body: "Welcome to our platform! We're excited to have you on board. This is a sample welcome email to get you started with our services.",
            status: CampaignStatus.SENT,
            sentBy: adminUsers[0].id,
            sentAt: new Date("2025-09-01T10:00:00Z"),
            recipientCount: 7,
            openCount: 5,
            clickCount: 3,
        },
        {
            subject: "Monthly Product Updates",
            sentTo: CampaignAudience.ACTIVE_SUBSCRIBERS,
            greeting: "Hello Valued Customer,",
            body: "Here are the latest updates and features we've released this month. We're constantly working to improve our platform based on your feedback.",
            status: CampaignStatus.DRAFT,
            sentBy: adminUsers[0].id,
            recipientCount: null,
            openCount: 0,
            clickCount: 0,
        },
        {
            subject: "Important Service Maintenance",
            sentTo: CampaignAudience.TENANTS,
            greeting: "Dear Tenant,",
            body: "We wanted to inform you about upcoming maintenance that may affect service availability. Please plan accordingly.",
            status: CampaignStatus.SCHEDULED,
            sentBy: adminUsers[0].id,
            scheduledAt: new Date("2025-09-15T02:00:00Z"),
            recipientCount: null,
            openCount: 0,
            clickCount: 0,
        },
    ];

    for (const campaignData of campaignsData) {
        try {
            const campaign = await prisma.tech_newsletter_campaigns.create({
                data: campaignData,
            });

            // Create sample recipients for the first campaign
            if (campaign.status === CampaignStatus.SENT) {
                for (const subscriber of subscribers) {
                    await prisma.tech_campaign_recipients.create({
                        data: {
                            campaignId: campaign.id,
                            subscriberId: subscriber.id,
                            email: subscriber.email,
                            status: "DELIVERED", // Sample status
                            openedAt: Math.random() > 0.3 ? new Date() : null, // 70% open rate
                            clickedAt: Math.random() > 0.7 ? new Date() : null, // 30% click rate
                        },
                    });
                }
            }

            console.log(
                `Campaign "${campaignData.subject}" seeded successfully`
            );
        } catch (error) {
            console.error(
                `Error seeding campaign "${campaignData.subject}":`,
                error
            );
        }
    }

    const campaignsCount = await prisma.tech_newsletter_campaigns.count();
    console.log(
        `Newsletter campaigns seeding completed! Total campaigns: ${campaignsCount}`
    );

    return await prisma.tech_newsletter_campaigns.findMany({
        include: {
            recipients: true,
        },
    });
}
