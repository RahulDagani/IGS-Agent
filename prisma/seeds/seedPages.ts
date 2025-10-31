import { PrismaClient, PageType, PageStatus } from "@prisma/client";

export async function seedPages(prisma: PrismaClient) {
    console.log("Seeding pages...");

    // Get an admin user to set as author
    const adminUsers = await prisma.tech_users.findMany({
        where: {
            role: {
                in: ["ADMIN", "SUPER_ADMIN"],
            },
        },
        take: 1,
    });

    const authorId = adminUsers[0]?.id;

    const pagesData = [
        {
            title: "About Us",
            slug: "about-us",
            content: `<h1>About Our Company</h1>
<p>Welcome to our platform! We are dedicated to providing the best services to our customers.</p>
<p>Our mission is to empower businesses with cutting-edge technology solutions that drive growth and success.</p>
<h2>Our Story</h2>
<p>Founded in 2020, we have been serving thousands of satisfied customers worldwide.</p>
<h2>Our Values</h2>
<ul>
<li>Customer First</li>
<li>Innovation</li>
<li>Excellence</li>
<li>Integrity</li>
</ul>`,
            type: PageType.INFORMATION,
            status: PageStatus.ACTIVE,
            metaTitle: "About Us - Learn About Our Company",
            metaDescription:
                "Learn about our company mission, values, and story. Discover what makes us different and why thousands trust our services.",
            metaKeywords: "about, company, mission, values, story, team",
            authorId: authorId,
            publishedAt: new Date("2025-01-15"),
        },
        {
            title: "News",
            slug: "news",
            content: `<h1>Latest News & Updates</h1>
<p>Stay informed with the latest developments, product updates, and company announcements.</p>
<div class="news-section">
<h2>Recent Updates</h2>
<p>Check back regularly for the most current information about our platform and services.</p>
</div>`,
            type: PageType.INFORMATION,
            status: PageStatus.ACTIVE,
            metaTitle: "News & Updates - Latest Company News",
            metaDescription:
                "Stay updated with the latest news, announcements, and product updates from our company.",
            authorId: authorId,
            publishedAt: new Date("2025-01-20"),
        },
        {
            title: "Investor Relations",
            slug: "investor-relations",
            content: `<h1>Investor Relations</h1>
<p>Welcome investors! This section provides comprehensive information about our company's financial performance and growth strategy.</p>
<h2>Financial Reports</h2>
<p>Access our latest quarterly and annual financial reports.</p>
<h2>Corporate Governance</h2>
<p>Learn about our leadership team and corporate governance practices.</p>`,
            type: PageType.INFORMATION,
            status: PageStatus.ACTIVE,
            metaTitle: "Investor Relations - Financial Information",
            metaDescription:
                "Access investor resources, financial reports, and corporate governance information.",
            authorId: authorId,
            publishedAt: new Date("2025-01-25"),
        },
        {
            title: "Careers",
            slug: "careers",
            content: `<h1>Join Our Team</h1>
<p>We're always looking for talented individuals to join our growing team. Explore current opportunities and become part of our success story.</p>
<h2>Why Work With Us?</h2>
<ul>
<li>Competitive salaries and benefits</li>
<li>Flexible work environment</li>
<li>Career growth opportunities</li>
<li>Innovative projects</li>
</ul>
<h2>Current Openings</h2>
<p>Check back soon for available positions.</p>`,
            type: PageType.INFORMATION,
            status: PageStatus.ACTIVE,
            metaTitle: "Careers - Join Our Team",
            metaDescription:
                "Explore career opportunities and join our innovative team. Competitive benefits and growth opportunities available.",
            authorId: authorId,
            publishedAt: new Date("2025-02-01"),
        },
        {
            title: "Contact Us",
            slug: "contact-us",
            content: `<h1>Get In Touch</h1>
<p>We'd love to hear from you! Reach out to us through any of the following channels:</p>
<h2>Contact Information</h2>
<p><strong>Email:</strong> support@example.com</p>
<p><strong>Phone:</strong> +1 (555) 123-4567</p>
<p><strong>Address:</strong> 123 Business Street, City, State 12345</p>
<h2>Business Hours</h2>
<p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
<p>Weekends: Closed</p>`,
            type: PageType.NEED_HELP,
            status: PageStatus.ACTIVE,
            metaTitle: "Contact Us - Get in Touch",
            metaDescription:
                "Contact our team for support, inquiries, or partnership opportunities. We're here to help!",
            authorId: authorId,
            publishedAt: new Date("2025-02-05"),
        },
        {
            title: "FAQ",
            slug: "faq",
            content: `<h1>Frequently Asked Questions</h1>
<p>Find answers to common questions about our services and platform.</p>
<h2>General Questions</h2>
<div class="faq-item">
<h3>How do I get started?</h3>
<p>Simply sign up for an account and follow the onboarding process.</p>
</div>
<div class="faq-item">
<h3>What payment methods do you accept?</h3>
<p>We accept all major credit cards, PayPal, and bank transfers.</p>
</div>
<div class="faq-item">
<h3>Is there a free trial?</h3>
<p>Yes, we offer a 14-day free trial for all new users.</p>
</div>
<h2>Technical Support</h2>
<div class="faq-item">
<h3>How do I reset my password?</h3>
<p>Click on "Forgot Password" on the login page and follow the instructions.</p>
</div>`,
            type: PageType.NEED_HELP,
            status: PageStatus.ACTIVE,
            metaTitle: "FAQ - Frequently Asked Questions",
            metaDescription:
                "Find answers to common questions about our services, billing, technical support, and more.",
            authorId: authorId,
            publishedAt: new Date("2025-02-10"),
        },
        {
            title: "Refund Policy",
            slug: "refund-policy",
            content: `<h1>Refund Policy</h1>
<p>We strive to ensure customer satisfaction with all our services. Please read our refund policy carefully.</p>
<h2>30-Day Money-Back Guarantee</h2>
<p>We offer a 30-day money-back guarantee for all our subscription plans. If you're not satisfied, you can request a full refund within 30 days of purchase.</p>
<h2>How to Request a Refund</h2>
<ol>
<li>Contact our support team via email</li>
<li>Provide your order details</li>
<li>Explain the reason for your refund request</li>
</ol>
<h2>Non-Refundable Items</h2>
<ul>
<li>Custom development services</li>
<li>Domain registration fees</li>
<li>Third-party integration costs</li>
</ul>
<h2>Processing Time</h2>
<p>Refunds are typically processed within 5-7 business days.</p>`,
            type: PageType.NEED_HELP,
            status: PageStatus.ACTIVE,
            metaTitle: "Refund Policy - Money Back Guarantee",
            metaDescription:
                "Learn about our refund policy, money-back guarantee, and how to request a refund for our services.",
            authorId: authorId,
            publishedAt: new Date("2025-02-15"),
        },
    ];

    for (const pageData of pagesData) {
        try {
            await prisma.tech_pages.upsert({
                where: { slug: pageData.slug },
                update: {},
                create: pageData,
            });
            console.log(`Page "${pageData.title}" seeded successfully`);
        } catch (error) {
            console.error(`Error seeding page "${pageData.title}":`, error);
        }
    }

    const pagesCount = await prisma.tech_pages.count();
    console.log(`Pages seeding completed! Total pages: ${pagesCount}`);

    return await prisma.tech_pages.findMany();
}
