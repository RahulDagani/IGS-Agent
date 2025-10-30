import { PrismaClient } from "@prisma/client";

export async function seedGeneralSettings(prisma: PrismaClient) {
    console.log("Seeding general settings...");

    // Check if general settings already exist
    const existingSettings = await prisma.tech_general_settings.findFirst();

    if (existingSettings) {
        console.log("General settings already exist, skipping...");
        return existingSettings;
    }

    const generalSettings = await prisma.tech_general_settings.create({
        data: {
            // Company Information
            companyName: "Study Abroad SaaS",
            companyTagline: "Your Gateway to Global Education",
            emailAddress: "admin@studyabroad-saas.com",
            phoneNumber: "+1-555-0123",
            address: "123 Education Street, Knowledge City, 10101",

            // Pricing Plan
            yearlyPlanDiscount: 20.0, // 20% discount for yearly plans
            trialDayCount: 14, // 14 days trial

            // Default Elements
            defaultLanguage: "en",
            defaultCurrency: "USD",
            copyrightText:
                "© 2024 Study Abroad SaaS Platform. All rights reserved.",

            // Social Media Links
            facebookLink: "https://facebook.com/studyabroadsaas",
            instagramLink: "https://instagram.com/studyabroadsaas",
            twitterLink: "https://twitter.com/studyabroadsaas",
            linkedinLink: "https://linkedin.com/company/studyabroadsaas",

            // Logo URLs
            whiteLogo: "/images/white_logo.png",
            blackLogo: "/images/black_logo.png",
            smallLogo: "/images/small_logo.png",
            favicon: "/images/favicon.png",

            // Features
            emailOtpVerification: true,
        },
    });

    console.log("General settings seeded successfully!");
    return generalSettings;
}
