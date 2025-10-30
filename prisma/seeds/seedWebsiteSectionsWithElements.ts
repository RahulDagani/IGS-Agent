import { PrismaClient, SectionStatus, ElementStatus } from "@prisma/client";

export async function seedWebsiteSectionsWithElements(prisma: PrismaClient) {
    console.log("Seeding website sections with elements...");

    try {
        const adminUsers = await prisma.tech_users.findMany({
            where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
            take: 1,
        });
        const authorId = adminUsers[0]?.id;

        // First, create the main sections
        const sectionsData = [
            {
                section_key: "features",
                section_name: "Features",
                order_index: 5,
                show_on_landing: true,
                status: SectionStatus.ACTIVE,
                content: {
                    tagline: "Awesome Features",
                    title: "Discover Our Awesome Features",
                    description:
                        "Acculance is an all-in-one management system to manage expenses, purchases, sales, payments, accounting, loans, assets, payroll, and many more.",
                    image: "/images/features.jpg",
                    status: "active",
                },
            },
            {
                section_key: "why_us",
                section_name: "Why Us",
                order_index: 3,
                show_on_landing: true,
                status: SectionStatus.ACTIVE,
                content: {
                    tagline: "Why Acculance SaaS?",
                    title: "Manage All Your Businesses in one place",
                    description:
                        "Acculance SaaS is one of the best Sales, Inventory, and Accounting Management software available in the market. Acculance SaaS is specially built to grow small businesses by adding digitalization to their business.",
                    image: "/images/why-us.jpg",
                },
            },
            {
                section_key: "explorers",
                section_name: "Explorers",
                order_index: 6,
                show_on_landing: true,
                status: SectionStatus.ACTIVE,
                content: {
                    image: "/images/explorer-demo.jpg",
                    title: "Explore Our Platform",
                    description:
                        "Take an interactive tour of our platform and discover how each feature can benefit your business operations.",
                    status: "active",
                    alignleft: false,
                    points: [
                        "Interactive demo environment",
                        "Step-by-step guided tour",
                        "Real-time feature exploration",
                    ],
                },
            },
            {
                section_key: "all_features",
                section_name: "All Features",
                order_index: 7,
                show_on_landing: true,
                status: SectionStatus.ACTIVE,
                content: {
                    tagline: "Core Modules",
                    title: "Core Modules For Your Business",
                    description:
                        "Comprehensive set of modules designed to cover all aspects of your business operations.",
                    image: "/images/all-features.jpg",
                    status: "active",
                },
            },
            {
                section_key: "software_overview",
                section_name: "Software Overview",
                order_index: 9,
                show_on_landing: true,
                status: SectionStatus.ACTIVE,
                content: {
                    tagline: "Dashboard Screenshot",
                    title: "Software Overview",
                    description:
                        "Get a comprehensive overview of our software interface and capabilities.",
                    image: "/images/software-overview.jpg",
                    status: "active",
                },
            },
            {
                section_key: "testimonial",
                section_name: "Testimonial",
                order_index: 11,
                show_on_landing: true,
                status: SectionStatus.ACTIVE,
                content: {
                    name: "Sarah Johnson",
                    title: "Amazing Platform for Business Growth",
                    description:
                        "This platform has completely transformed how we manage our operations.",
                    image: "/images/testimonials/sarah.jpg",
                    status: "active",
                },
            },
            {
                section_key: "brands",
                section_name: "Brands",
                order_index: 12,
                show_on_landing: true,
                status: SectionStatus.ACTIVE,
                content: {
                    name: "TechCorp Inc.",
                    image: "/images/brands/techcorp.png",
                    status: "active",
                },
            },
        ];

        // Create sections and their elements
        for (const sectionData of sectionsData) {
            try {
                const section = await prisma.tech_website_sections.upsert({
                    where: { section_key: sectionData.section_key },
                    update: {
                        content: sectionData.content,
                        show_on_landing: sectionData.show_on_landing,
                        status: sectionData.status,
                        order_index: sectionData.order_index,
                        updated_by: authorId,
                    },
                    create: {
                        ...sectionData,
                        created_by: authorId,
                        updated_by: authorId,
                    },
                });

                console.log(
                    `✅ Section "${sectionData.section_name}" seeded successfully`
                );

                // Seed elements based on section type
                switch (sectionData.section_key) {
                    case "features":
                        await seedFeatureElements(prisma, section.id);
                        break;
                    case "why_us":
                        await seedWhyUsElements(prisma, section.id);
                        break;
                    case "explorers":
                        await seedExplorerElements(prisma, section.id);
                        break;
                    case "all_features":
                        await seedAllFeatureElements(prisma, section.id);
                        break;
                    case "software_overview":
                        await seedSoftwareElements(prisma, section.id);
                        break;
                    case "testimonial":
                        await seedTestimonialElements(prisma, section.id);
                        break;
                    case "brands":
                        await seedBrandElements(prisma, section.id);
                        break;
                }
            } catch (error) {
                console.error(
                    `❌ Error seeding section "${sectionData.section_name}":`,
                    error
                );
            }
        }

        console.log("Website sections with elements seeding completed!");
    } catch (error) {
        console.error(
            "Critical error in seedWebsiteSectionsWithElements:",
            error
        );
        throw error;
    }
}

// Helper functions to seed elements for each section type
async function seedFeatureElements(prisma: PrismaClient, sectionId: number) {
    const elements = [
        {
            title: "Easy POS",
            description:
                "Simple and intuitive Point of Sale system for seamless transactions",
            image: "/images/features/pos.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 1,
        },
        {
            title: "Barcode Generator",
            description:
                "Generate and manage barcodes for your products efficiently",
            image: "/images/features/barcode.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 2,
        },
        {
            title: "Role Management",
            description:
                "Comprehensive user role and permission management system",
            image: "/images/features/roles.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 3,
        },
        {
            title: "Reports Insights",
            description:
                "Advanced reporting and analytics for business intelligence",
            image: "/images/features/reports.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 4,
        },
    ];

    for (const element of elements) {
        await prisma.tech_feature_elements.create({
            data: { ...element, section_id: sectionId },
        });
    }
    console.log("✅ Feature elements seeded");
}

async function seedWhyUsElements(prisma: PrismaClient, sectionId: number) {
    const elements = [
        {
            title: "Multitenancy",
            description:
                "The multitenancy feature allows multiple businesses to use the same instance securely",
            image: "/images/why-us/multitenancy.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 1,
        },
        {
            title: "Multilingual",
            description:
                "Multilingual feature allows your business to operate in multiple languages",
            image: "/images/why-us/multilingual.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 2,
        },
        {
            title: "SPA",
            description:
                "Acculance SaaS is a Single Page Application for fast and smooth user experience",
            image: "/images/why-us/spa.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 3,
        },
        {
            title: "Custom Domain",
            description:
                "Acculance SaaS can be used with your own custom domain for branding",
            image: "/images/why-us/domain.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 4,
        },
    ];

    for (const element of elements) {
        await prisma.tech_why_us_elements.create({
            data: { ...element, section_id: sectionId },
        });
    }
    console.log("✅ Why Us elements seeded");
}

async function seedExplorerElements(prisma: PrismaClient, sectionId: number) {
    const elements = [
        {
            title: "Automate Your Business",
            description:
                "Streamline operations with intelligent automation workflows",
            image: "/images/explorers/automate.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 1,
        },
        {
            title: "Remove Your PaperWork",
            description:
                "Go paperless with digital document management and processing",
            image: "/images/explorers/paperless.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 2,
        },
        {
            title: "Go Beyond Your Expectation",
            description:
                "Exceed business goals with advanced features and capabilities",
            image: "/images/explorers/beyond.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 3,
        },
    ];

    for (const element of elements) {
        await prisma.tech_explorer_elements.create({
            data: { ...element, section_id: sectionId },
        });
    }
    console.log("✅ Explorer elements seeded");
}

async function seedAllFeatureElements(prisma: PrismaClient, sectionId: number) {
    const elements = [
        {
            title: "Customer Management",
            description:
                "Comprehensive customer relationship management system",
            image: "/images/all-features/customers.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 1,
        },
        {
            title: "Supplier Management",
            description: "Efficient supplier and vendor management tools",
            image: "/images/all-features/suppliers.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 2,
        },
        {
            title: "Employee Management",
            description: "Complete employee and HR management system",
            image: "/images/all-features/employees.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 3,
        },
    ];

    for (const element of elements) {
        await prisma.tech_all_feature_elements.create({
            data: { ...element, section_id: sectionId },
        });
    }
    console.log("✅ All Features elements seeded");
}

async function seedSoftwareElements(prisma: PrismaClient, sectionId: number) {
    const elements = [
        {
            title: "Dashboard Overview",
            description: "Comprehensive business dashboard with key metrics",
            image: "/images/software/dashboard-1.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 1,
        },
        {
            title: "Analytics View",
            description: "Detailed analytics and reporting interface",
            image: "/images/software/analytics.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 2,
        },
        {
            title: "Inventory Management",
            description: "Stock and inventory management screen",
            image: "/images/software/inventory.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 3,
        },
        {
            title: "Sales Dashboard",
            description: "Sales performance and tracking interface",
            image: "/images/software/sales.jpg",
            status: ElementStatus.ACTIVE,
            order_index: 4,
        },
    ];

    for (const element of elements) {
        await prisma.tech_software_elements.create({
            data: { ...element, section_id: sectionId },
        });
    }
    console.log("✅ Software elements seeded");
}

async function seedTestimonialElements(
    prisma: PrismaClient,
    sectionId: number
) {
    const elements = [
        {
            name: "Sarah Johnson",
            title: "CTO at TechCorp",
            description:
                "This platform has transformed how our team collaborates. The automation features alone saved us 20 hours per week!",
            image: "/images/testimonials/sarah.jpg",
            rating: 5,
            company: "TechCorp Inc.",
            status: ElementStatus.ACTIVE,
            order_index: 1,
        },
        {
            name: "Michael Chen",
            title: "Operations Director",
            description:
                "The analytics dashboard provided insights we never had before. Our decision-making process is now data-driven.",
            image: "/images/testimonials/michael.jpg",
            rating: 5,
            company: "Global Solutions",
            status: ElementStatus.ACTIVE,
            order_index: 2,
        },
        {
            name: "Emily Rodriguez",
            title: "Founder & CEO",
            description:
                "As a growing startup, we needed a scalable solution. This platform grew with us and supported our rapid expansion.",
            image: "/images/testimonials/emily.jpg",
            rating: 5,
            company: "Startup Ventures",
            status: ElementStatus.ACTIVE,
            order_index: 3,
        },
    ];

    for (const element of elements) {
        await prisma.tech_testimonial_elements.create({
            data: { ...element, section_id: sectionId },
        });
    }
    console.log("✅ Testimonial elements seeded");
}

async function seedBrandElements(prisma: PrismaClient, sectionId: number) {
    const elements = [
        {
            name: "TechCorp Inc.",
            image: "/images/brands/techcorp.png",
            website_url: "https://techcorp.com",
            status: ElementStatus.ACTIVE,
            order_index: 1,
        },
        {
            name: "Global Solutions",
            image: "/images/brands/global-solutions.png",
            website_url: "https://globalsolutions.com",
            status: ElementStatus.ACTIVE,
            order_index: 2,
        },
        {
            name: "Startup Ventures",
            image: "/images/brands/startup-ventures.png",
            website_url: "https://startupventures.com",
            status: ElementStatus.ACTIVE,
            order_index: 3,
        },
        {
            name: "Innovate Labs",
            image: "/images/brands/innovate-labs.png",
            website_url: "https://innovatelabs.com",
            status: ElementStatus.ACTIVE,
            order_index: 4,
        },
    ];

    for (const element of elements) {
        await prisma.tech_brand_elements.create({
            data: { ...element, section_id: sectionId },
        });
    }
    console.log("✅ Brand elements seeded");
}
