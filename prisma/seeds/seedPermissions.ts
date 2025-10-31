import { PrismaClient } from "@prisma/client";

export async function seedPermissions(prisma: PrismaClient) {
    console.log("Seeding permissions...");

    const permissions = [
        // Dashboard View
        {
            name: "account-summery",
            category: "Dashboard",
            description: "View account summary",
        },
        {
            name: "top-clients",
            category: "Dashboard",
            description: "View top clients",
        },
        {
            name: "top-plans",
            category: "Dashboard",
            description: "View top plans",
        },

        // Domain Management
        {
            name: "domain-management",
            category: "Domain",
            description: "Manage domains",
        },

        // Pages
        {
            name: "pages-management",
            category: "Content",
            description: "Manage pages",
        },

        // Role & Permissions
        {
            name: "user-role",
            category: "Security",
            description: "Manage roles and permissions",
        },

        // Advanced Settings
        {
            name: "advanced-settings",
            category: "Settings",
            description: "Access advanced settings",
        },

        // Setup
        {
            name: "general-settings",
            category: "Settings",
            description: "Manage general settings",
        },
        {
            name: "payment-settings",
            category: "Settings",
            description: "Manage payment settings",
        },
        {
            name: "user-management",
            category: "Security",
            description: "Manage users",
        },

        // Plans
        {
            name: "plans-management",
            category: "Billing",
            description: "Manage subscription plans",
        },
        {
            name: "features-management",
            category: "Billing",
            description: "Manage pricing features",
        },

        // Subscriber
        {
            name: "newsletters-management",
            category: "Marketing",
            description: "Manage newsletter subscribers",
        },

        // Extra Management
        {
            name: "database-backup",
            category: "System",
            description: "Manage database backups",
        },
        { name: "payments", category: "Billing", description: "View payments" },
        {
            name: "update-profile",
            category: "User",
            description: "Update user profile",
        },

        // Landing Page
        {
            name: "landing-page-management",
            category: "Content",
            description: "Manage landing pages",
        },

        // Promotion
        {
            name: "promotion",
            category: "Marketing",
            description: "Manage promotions",
        },

        // Tenants
        {
            name: "tenants-management",
            category: "Tenant",
            description: "Manage tenants",
        },
    ];

    for (const permissionData of permissions) {
        await prisma.tech_permissions.upsert({
            where: { name: permissionData.name },
            update: permissionData,
            create: permissionData,
        });
    }

    console.log("Permissions seeded successfully!");
    return permissions;
}
