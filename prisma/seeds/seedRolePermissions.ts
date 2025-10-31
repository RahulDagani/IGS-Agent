import { PrismaClient } from "@prisma/client";

export async function seedRolePermissions(prisma: PrismaClient) {
    console.log("Seeding role permissions...");

    // Get all permissions and roles - no need for explicit types
    const allPermissions = await prisma.tech_permissions.findMany();
    const roles = await prisma.tech_roles.findMany();

    const superAdminRole = roles.find((r) => r.name === "SUPER_ADMIN");
    const adminRole = roles.find((r) => r.name === "ADMIN");
    const subAdminRole = roles.find((r) => r.name === "SUB_ADMIN");
    const employeeRole = roles.find((r) => r.name === "EMPLOYEE");

    if (!superAdminRole || !adminRole || !subAdminRole || !employeeRole) {
        throw new Error("Required roles not found");
    }

    // SUPER_ADMIN gets all permissions
    for (const permission of allPermissions) {
        await prisma.tech_role_permissions.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: superAdminRole.id,
                permissionId: permission.id,
            },
        });
    }

    // ADMIN gets most permissions except system-level ones
    const adminPermissions = allPermissions.filter(
        (p) =>
            !["user-role", "database-backup", "advanced-settings"].includes(
                p.name
            )
    );

    for (const permission of adminPermissions) {
        await prisma.tech_role_permissions.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: permission.id,
            },
        });
    }

    // SUB_ADMIN gets limited permissions
    const subAdminPermissions = allPermissions.filter((p) =>
        [
            "account-summery",
            "top-clients",
            "top-plans",
            "user-management",
            "update-profile",
            "payments",
        ].includes(p.name)
    );

    for (const permission of subAdminPermissions) {
        await prisma.tech_role_permissions.upsert({
            where: {
                roleId_permissionId: {
                    roleId: subAdminRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: subAdminRole.id,
                permissionId: permission.id,
            },
        });
    }

    // EMPLOYEE gets basic permissions
    const employeePermissions = allPermissions.filter((p) =>
        ["account-summery", "update-profile"].includes(p.name)
    );

    for (const permission of employeePermissions) {
        await prisma.tech_role_permissions.upsert({
            where: {
                roleId_permissionId: {
                    roleId: employeeRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: employeeRole.id,
                permissionId: permission.id,
            },
        });
    }

    console.log("Role permissions seeded successfully!");
}
