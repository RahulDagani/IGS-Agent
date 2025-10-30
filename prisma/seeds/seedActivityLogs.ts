import {
    PrismaClient,
    LogAction,
    EntityType,
    LogSeverity,
    LogStatus,
    UserRole,
} from "@prisma/client";

export async function seedActivityLogs(prisma: PrismaClient) {
    console.log("Seeding activity logs...");

    try {
        // Get only ADMIN and SUPER_ADMIN users
        const users = await prisma.tech_users.findMany({
            where: {
                role: {
                    in: ["ADMIN", "SUPER_ADMIN"],
                },
            },
            take: 5,
        });

        if (users.length === 0) {
            console.log("No admin users found. Please seed users first.");
            return;
        }

        const activityLogsData = [
            // User Management Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.CREATE,
                entity_type: EntityType.USER,
                entity_id: users[1]?.id || 1,
                entity_name: "New User Account",
                description:
                    "Created new user account for employee@example.com",
                old_values: null,
                new_values: {
                    email: "employee@example.com",
                    role: "EMPLOYEE",
                    status: "active",
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
                metadata: {
                    source: "admin_panel",
                    browser: "Chrome",
                    os: "Windows 10",
                },
            },
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.UPDATE,
                entity_type: EntityType.USER,
                entity_id: users[1]?.id || 1,
                entity_name: "User Role Update",
                description: "Updated user role from EMPLOYEE to ADMIN",
                old_values: {
                    role: "EMPLOYEE",
                },
                new_values: {
                    role: "ADMIN",
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
            },

            // Tenant Management Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.CREATE,
                entity_type: EntityType.TENANT,
                entity_id: 1,
                entity_name: "TechCorp Inc.",
                description:
                    "Created new tenant 'TechCorp Inc.' with domain techcorp.example.com",
                old_values: null,
                new_values: {
                    name: "TechCorp Inc.",
                    domain: "techcorp.example.com",
                    plan: "Enterprise Plan",
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
            },

            // Payment Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.PAYMENT_SUCCESS,
                entity_type: EntityType.PAYMENT,
                entity_id: 1,
                entity_name: "Payment TRX123456",
                description:
                    "Payment of $3499 completed successfully for Pro Plan",
                old_values: null,
                new_values: {
                    amount: 3499,
                    plan: "Pro Plan",
                    status: "paid",
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
                metadata: {
                    payment_method: "credit_card",
                    gateway: "stripe",
                },
            },

            // Subscription Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.APPROVE,
                entity_type: EntityType.SUBSCRIPTION_REQUEST,
                entity_id: 1,
                entity_name: "Subscription Approval",
                description: "Approved subscription request for TechCorp Inc.",
                old_values: {
                    status: "pending",
                },
                new_values: {
                    status: "approved",
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
            },

            // Domain Management Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.DOMAIN_CONNECTED,
                entity_type: EntityType.DOMAIN,
                entity_id: 1,
                entity_name: "example.com",
                description:
                    "Domain example.com successfully connected and verified",
                old_values: {
                    status: "pending",
                    verified: false,
                },
                new_values: {
                    status: "connected",
                    verified: true,
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
            },

            // Security Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.LOGIN,
                entity_type: EntityType.USER,
                entity_id: users[0].id,
                entity_name: "Admin Login",
                description: "Admin successfully logged into the system",
                old_values: null,
                new_values: {
                    last_login: new Date().toISOString(),
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
                metadata: {
                    device: "desktop",
                    location: "Office Network",
                },
            },

            // System Activities
            {
                user_id: null,
                user_name: "System",
                user_email: null,
                user_role: null,
                action: LogAction.BACKUP,
                entity_type: EntityType.SYSTEM,
                entity_id: null,
                entity_name: "System Backup",
                description:
                    "Automated daily database backup completed successfully",
                old_values: null,
                new_values: {
                    backup_size: "2.5GB",
                    duration: "15 minutes",
                },
                ip_address: null,
                user_agent: null,
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
                metadata: {
                    backup_type: "full",
                    retention_days: 30,
                },
            },

            // Error/Failed Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.PAYMENT_FAILED,
                entity_type: EntityType.PAYMENT,
                entity_id: 3,
                entity_name: "Payment TRX567890",
                description: "Payment failed due to insufficient funds",
                old_values: null,
                new_values: {
                    amount: 81299,
                    plan: "Enterprise Plan",
                    status: "failed",
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.ERROR,
                status: LogStatus.FAILED,
                metadata: {
                    payment_method: "bank_transfer",
                    error_code: "insufficient_funds",
                    gateway: "stripe",
                },
            },

            // Content Management Activities
            {
                user_id: users[0].id,
                user_name: users[0].name || "System Admin",
                user_email: users[0].email || "admin@example.com",
                user_role: users[0].role as UserRole,
                action: LogAction.UPDATE,
                entity_type: EntityType.WEBSITE_SECTION,
                entity_id: 1,
                entity_name: "Hero Section",
                description: "Updated hero section title and background image",
                old_values: {
                    title: "Welcome to Our Platform",
                    backgroundImage: "/images/old-hero.jpg",
                },
                new_values: {
                    title: "Transform Your Business with Our Platform",
                    backgroundImage: "/images/hero-bg.jpg",
                },
                ip_address: "192.168.1.100",
                user_agent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                severity: LogSeverity.INFO,
                status: LogStatus.SUCCESS,
            },
        ];

        let successCount = 0;
        for (const logData of activityLogsData) {
            try {
                // Create logs with different timestamps to simulate real activity
                const createdAt = new Date();
                createdAt.setDate(
                    createdAt.getDate() - Math.floor(Math.random() * 30)
                );
                createdAt.setHours(Math.floor(Math.random() * 24));
                createdAt.setMinutes(Math.floor(Math.random() * 60));

                await prisma.tech_activity_logs.create({
                    data: {
                        ...logData,
                        created_at: createdAt,
                        updated_at: createdAt,
                    } as any, // Using type assertion to bypass TypeScript strict checking
                });
                successCount++;
            } catch (error) {
                console.error(`Error seeding activity log:`, error);
            }
        }

        console.log(
            `Activity logs seeding completed! ${successCount}/${activityLogsData.length} logs created`
        );
        return await prisma.tech_activity_logs.findMany({
            orderBy: { created_at: "desc" },
            take: 10,
        });
    } catch (error) {
        console.error("Critical error in seedActivityLogs:", error);
        throw error;
    }
}
