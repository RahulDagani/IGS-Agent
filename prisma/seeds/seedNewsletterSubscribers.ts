import { PrismaClient } from "@prisma/client";

export async function seedNewsletterSubscribers(prisma: PrismaClient) {
    console.log("Seeding newsletter subscribers...");

    const subscribersData = [
        {
            email: "john.doe@example.com",
            subscribedAt: new Date("2025-09-02"),
            source: "website_signup",
        },
        {
            email: "jane.smith@example.com",
            subscribedAt: new Date("2025-09-02"),
            source: "website_signup",
        },
        {
            email: "test.user123@gmail.com",
            subscribedAt: new Date("2025-09-02"),
            source: "form_submission",
        },
        {
            email: "fake.email@fakedomain.com",
            subscribedAt: new Date("2025-09-02"),
            source: "form_submission",
        },
        {
            email: "notreal@example.net",
            subscribedAt: new Date("2025-09-02"),
            source: "website_signup",
        },
        {
            email: "random.email@example.org",
            subscribedAt: new Date("2025-09-02"),
            source: "manual_add",
        },
        {
            email: "user42@example.com",
            subscribedAt: new Date("2025-09-02"),
            source: "website_signup",
        },
    ];

    for (const subscriberData of subscribersData) {
        try {
            await prisma.tech_newsletter_subscribers.upsert({
                where: { email: subscriberData.email },
                update: {},
                create: subscriberData,
            });
            console.log(
                `Subscriber ${subscriberData.email} seeded successfully`
            );
        } catch (error) {
            console.error(
                `Error seeding subscriber ${subscriberData.email}:`,
                error
            );
        }
    }

    const subscribersCount = await prisma.tech_newsletter_subscribers.count();
    console.log(
        `Newsletter subscribers seeding completed! Total subscribers: ${subscribersCount}`
    );

    return await prisma.tech_newsletter_subscribers.findMany();
}
