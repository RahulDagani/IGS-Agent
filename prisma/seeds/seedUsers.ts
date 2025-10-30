import { PrismaClient } from "@prisma/client";

import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
    const plainPassword = "Password123"; // Default password for all seeded users
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const superAdmin = await prisma.tech_users.upsert({
        where: { email: "superadmin@example.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "superadmin@example.com",
            device_type: "web",
            role: "SUPER_ADMIN",
            password: hashedPassword,
        },
    });

    const agentUser = await prisma.tech_users.upsert({
        where: { email: "agent@example.com" },
        update: {},
        create: {
            name: "John",
            email: "agent@example.com",
            device_type: "mobile",
            role: "ADMIN",
            password: hashedPassword,
        },
    });

    console.log("✅ Users seeded with hashed passwords");
    return { superAdmin, agentUser };
}
