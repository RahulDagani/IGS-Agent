import { PrismaClient } from "@prisma/client";

export async function seedPaymentSettings(prisma: PrismaClient) {
    console.log("Seeding payment settings...");

    // Check if payment settings already exist
    const existingSettings = await prisma.tech_payment_settings.findFirst();

    if (existingSettings) {
        console.log("Payment settings already exist, skipping...");
        return existingSettings;
    }

    const paymentSettings = await prisma.tech_payment_settings.create({
        data: {
            manualPayment: {
                isActive: true,
                note: "Please transfer the payment to our bank account and upload the receipt. Our account details will be shared after order confirmation.",
            },
            stripe: {
                isActive: false,
                secret: "",
            },
            paypal: {
                isActive: false,
                mode: "sandbox",
                clientId: "",
                clientSecret: "",
            },
            paystack: {
                isActive: false,
                merchantEmail: "",
                publicKey: "",
                secretKey: "",
            },
            razorpay: {
                isActive: false,
                keyId: "",
                keySecret: "",
            },
            currencyExchange: {
                isActive: false,
                apiKey: "",
            },
        },
    });

    console.log("Payment settings seeded successfully!");
    return paymentSettings;
}
