import { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient) {
    console.log("Seeding roles...");

    // Create system roles
    const roles = [
        {
            name: "SUPER_ADMIN",
            description: "Full system access with all permissions",
            isSystem: true,
        },
        {
            name: "ADMIN",
            description: "Administrative access with most permissions",
            isSystem: true,
        },
        {
            name: "SUB_ADMIN",
            description: "Limited administrative access",
            isSystem: true,
        },
        {
            name: "EMPLOYEE",
            description: "Employee access with specific permissions",
            isSystem: true,
        },
        // {
        //     name: "AGENT",
        //     description: "Agent access for client management",
        //     isSystem: true,
        // },
        // {
        //     name: "STUDENT",
        //     description: "Student access with basic permissions",
        //     isSystem: true,
        // },
    ];

    const createdRoles = [];
    for (const roleData of roles) {
        const role = await prisma.tech_roles.upsert({
            where: { name: roleData.name },
            update: roleData,
            create: roleData,
        });
        createdRoles.push(role);
    }

    console.log("Roles seeded successfully!");
    return createdRoles;
}
