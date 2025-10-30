import { PrismaClient } from "@prisma/client";

export async function seedCurrencies(prisma: PrismaClient) {
    console.log("Seeding currencies...");

    // Check if currencies already exist
    const existingCurrencies = await prisma.tech_currencies.findMany();

    if (existingCurrencies.length > 0) {
        console.log("Currencies already exist, skipping...");
        return existingCurrencies;
    }

    const currencies = await prisma.tech_currencies.createMany({
        data: [
            {
                name: "US Dollar",
                code: "USD",
                rate: 1.0,
                symbol: "$",
                position: "left",
                status: true,
                note: "Base currency",
            },
            {
                name: "Euro",
                code: "EUR",
                rate: 0.85,
                symbol: "€",
                position: "right",
                status: true,
                note: "European Union currency",
            },
            {
                name: "British Pound",
                code: "GBP",
                rate: 0.73,
                symbol: "£",
                position: "left",
                status: true,
                note: "United Kingdom currency",
            },
            {
                name: "Japanese Yen",
                code: "JPY",
                rate: 110.5,
                symbol: "¥",
                position: "left",
                status: true,
                note: "Japanese currency",
            },
            {
                name: "Canadian Dollar",
                code: "CAD",
                rate: 1.25,
                symbol: "C$",
                position: "left",
                status: true,
                note: "Canadian currency",
            },
            {
                name: "Australian Dollar",
                code: "AUD",
                rate: 1.35,
                symbol: "A$",
                position: "left",
                status: true,
                note: "Australian currency",
            },
            {
                name: "Indian Rupee",
                code: "INR",
                rate: 74.5,
                symbol: "₹",
                position: "left",
                status: true,
                note: "Indian currency",
            },
            {
                name: "Chinese Yuan",
                code: "CNY",
                rate: 6.45,
                symbol: "¥",
                position: "left",
                status: true,
                note: "Chinese currency",
            },
        ],
    });

    console.log("Currencies seeded successfully!");
    return currencies;
}
