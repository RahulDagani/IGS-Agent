import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Seed in correct order to maintain foreign key relationships
    await seedPlans();
    await seedTenants();
    await seedDomains();
    await seedTenantUsers();
    await seedAdminProfiles();
    await seedStaffProfiles();
    await seedAgentProfiles();
    await seedStudentProfiles();
    await seedUniversities();
    await seedCourses();
    await seedSubscriptions();
    await seedUserPermissions();
    await seedApplications();
    
    console.log('✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 1. apply_plans seeds
// 1. apply_plans seeds
async function seedPlans() {
  console.log('Seeding apply_plans...');

  const plans = [
    {
      uuid: 'plan-starter-001', // Add predefined UUIDs
      name: 'Starter',
      description: 'Perfect for small agencies just getting started',
      price_monthly: 49,
      price_yearly: 490,
      features: {
        student_portal: true,
        agent_portal: false,
        max_students: 100,
        max_agents: 3,
        support: 'email',
        storage_gb: 5
      },
      limits: {
        applications_per_month: 50,
        universities: 10,
        courses: 100,
        staff_users: 2
      },
      is_active: true,
      is_default: false,
      sort_order: 1
    },
    {
      uuid: 'plan-professional-002',
      name: 'Professional',
      description: 'Ideal for growing education agencies',
      price_monthly: 99,
      price_yearly: 990,
      features: {
        student_portal: true,
        agent_portal: true,
        max_students: 500,
        max_agents: 10,
        support: 'priority',
        storage_gb: 20
      },
      limits: {
        applications_per_month: 200,
        universities: 50,
        courses: 500,
        staff_users: 5
      },
      is_active: true,
      is_default: true,
      sort_order: 2
    },
    {
      uuid: 'plan-enterprise-003',
      name: 'Enterprise',
      description: 'For large education consultancies',
      price_monthly: 199,
      price_yearly: 1990,
      features: {
        student_portal: true,
        agent_portal: true,
        max_students: 2000,
        max_agents: 50,
        support: 'dedicated',
        storage_gb: 100
      },
      limits: {
        applications_per_month: 1000,
        universities: 200,
        courses: 2000,
        staff_users: 20
      },
      is_active: true,
      is_default: false,
      sort_order: 3
    }
  ];

  for (const plan of plans) {
    await prisma.apply_plans.upsert({
      where: { uuid: plan.uuid }, // Use UUID as unique identifier
      update: plan,
      create: plan
    });
  }

  console.log('✓ apply_plans seeded successfully');
}

// 2. apply_tenants seeds
async function seedTenants() {
  console.log('Seeding apply_tenants...');

  const tenants = [
    {
      name: 'Global Education Hub',
      company_name: 'Global Education Hub Ltd',
      subdomain: 'globaledu',
      custom_domain: 'apply.globaleducationhub.com',
      email: 'admin@globaleducationhub.com',
      password_hash: '$2b$10$examplehashedpassword123456789012',
      plan_id: 2, // Professional plan
      status: 'ACTIVE' as const,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subscription_ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      is_active: true,
      settings: {
        theme: 'blue',
        language: 'en',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY'
      }
    },
    {
      name: 'Student Connect',
      company_name: 'Student Connect Agency',
      subdomain: 'studentconnect',
      email: 'info@studentconnect.com',
      password_hash: '$2b$10$examplehashedpassword123456789012',
      plan_id: 1, // Starter plan
      status: 'ACTIVE' as const,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      is_active: true,
      settings: {
        theme: 'green',
        language: 'en',
        timezone: 'America/New_York',
        date_format: 'DD/MM/YYYY'
      }
    }
  ];

  for (const tenant of tenants) {
    await prisma.apply_tenants.upsert({
      where: { subdomain: tenant.subdomain },
      update: tenant,
      create: tenant
    });
  }

  console.log('✓ apply_tenants seeded successfully');
}

// 3. apply_domains seeds
async function seedDomains() {
  console.log('Seeding apply_domains...');

  const domains = [
    {
      tenant_id: 1,
      domain: 'apply.globaleducationhub.com',
      type: 'CUSTOM' as const,
      status: 'ACTIVE' as const,
      is_primary: true,
      verified_at: new Date()
    },
    {
      tenant_id: 1,
      domain: 'globaledu.applyplatform.com',
      type: 'SUBDOMAIN' as const,
      status: 'ACTIVE' as const,
      is_primary: false,
      verified_at: new Date()
    },
    {
      tenant_id: 2,
      domain: 'studentconnect.applyplatform.com',
      type: 'SUBDOMAIN' as const,
      status: 'ACTIVE' as const,
      is_primary: true,
      verified_at: new Date()
    }
  ];

  for (const domain of domains) {
    await prisma.apply_domains.upsert({
      where: { domain: domain.domain },
      update: domain,
      create: domain
    });
  }

  console.log('✓ apply_domains seeded successfully');
}

// 4. apply_tenant_users seeds
 async function seedTenantUsers() {
  console.log('Seeding apply_tenant_users...');

  const users = [
    // Tenant 1 - Global Education Hub
    {
      tenant_id: 1,
      email: 'admin@globaleducationhub.com',
      password_hash: '$2b$10$examplehashedpassword123456789012',
      name: 'John Smith',
      phone: '+1234567890',
      role: 'TENANT_ADMIN' as const,
      is_active: true,
      is_email_verified: true
    },
    {
      tenant_id: 1,
      email: 'staff1@globaleducationhub.com',
      password_hash: '$2b$10$examplehashedpassword123456789012',
      name: 'Sarah Johnson',
      phone: '+1234567891',
      role: 'TENANT_STAFF' as const,
      is_active: true,
      is_email_verified: true
    },
    {
      tenant_id: 1,
      email: 'agent1@globaleducationhub.com',
      password_hash: '$2b$10$examplehashedpassword123456789012',
      name: 'Mike Wilson',
      phone: '+1234567892',
      role: 'TENANT_AGENT' as const,
      is_active: true,
      is_email_verified: true
    },
    {
      tenant_id: 1,
      email: 'student1@globaleducationhub.com',
      password_hash: '$2b$10$examplehashedpassword123456789012',
      name: 'Alice Brown',
      phone: '+1234567894',
      role: 'TENANT_STUDENT' as const,
      is_active: true,
      is_email_verified: true
    },
    // Tenant 2 - Student Connect
    {
      tenant_id: 2,
      email: 'admin@studentconnect.com',
      password_hash: '$2b$10$examplehashedpassword123456789012',
      name: 'Emma Davis',
      phone: '+1234567893',
      role: 'TENANT_ADMIN' as const,
      is_active: true,
      is_email_verified: true
    }
  ];

  for (const user of users) {
    try {
      // Use type assertion to fix the TypeScript error
      await prisma.apply_tenant_users.create({
        data: user as any
      });
    } catch (error: any) {
      // If user already exists (unique constraint violation), skip it
      if (error.code === 'P2002') {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }
      throw error; // Re-throw other errors
    }
  }

  console.log('✓ apply_tenant_users seeded successfully');
}

// 5. apply_tenant_admin_profiles seeds
async function seedAdminProfiles() {
  console.log('Seeding apply_tenant_admin_profiles...');

  const adminProfiles = [
    {
      tenant_id: 1,
      user_id: 1,
      is_primary_admin: true,
      can_manage_billing: true,
      can_manage_users: true,
      can_manage_settings: true
    },
    {
      tenant_id: 2,
      user_id: 5,
      is_primary_admin: true,
      can_manage_billing: true,
      can_manage_users: true,
      can_manage_settings: true
    }
  ];

  for (const profile of adminProfiles) {
    await prisma.apply_tenant_admin_profiles.upsert({
      where: { user_id: profile.user_id },
      update: profile,
      create: profile
    });
  }

  console.log('✓ apply_tenant_admin_profiles seeded successfully');
}

// 6. apply_tenant_staff_profiles seeds
async function seedStaffProfiles() {
  console.log('Seeding apply_tenant_staff_profiles...');

  const staffProfiles = [
    {
      tenant_id: 1,
      user_id: 2,
      department: 'Admissions',
      position: 'Admissions Officer',
      notes: 'Handles UK applications'
    }
  ];

  for (const profile of staffProfiles) {
    await prisma.apply_tenant_staff_profiles.upsert({
      where: { user_id: profile.user_id },
      update: profile,
      create: profile
    });
  }

  console.log('✓ apply_tenant_staff_profiles seeded successfully');
}

// 7. apply_tenant_agent_profiles seeds
async function seedAgentProfiles() {
  console.log('Seeding apply_tenant_agent_profiles...');

  const agentProfiles = [
    {
      tenant_id: 1,
      user_id: 3,
      agency_name: 'Wilson Education Services',
      registration_number: 'REG123456',
      business_address: {
        street: '123 Education St',
        city: 'London',
        country: 'UK',
        postal_code: 'SW1A 1AA'
      },
      contact_person: 'Mike Wilson',
      website: 'https://wilsoneducation.com',
      social_media: {
        facebook: 'wilsoneducation',
        linkedin: 'company/wilsoneducation'
      },
      commission_rate: 15.0,
      is_verified: true,
      total_students: 25,
      successful_applications: 18
    }
  ];

  for (const profile of agentProfiles) {
    await prisma.apply_tenant_agent_profiles.upsert({
      where: { user_id: profile.user_id },
      update: profile,
      create: profile
    });
  }

  console.log('✓ apply_tenant_agent_profiles seeded successfully');
}

// 8. apply_tenant_student_profiles seeds
async function seedStudentProfiles() {
  console.log('Seeding apply_tenant_student_profiles...');

  const studentProfiles = [
    {
      tenant_id: 1,
      user_id: 4,
      student_type: 'DIRECT' as const,
      date_of_birth: new Date('2000-05-15'),
      gender: 'Female',
      nationality: 'Indian',
      passport_number: 'A12345678',
      address: {
        street: '456 Student Ave',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400001'
      },
      emergency_contact: {
        name: 'Parent Name',
        relationship: 'Father',
        phone: '+912345678901',
        email: 'parent@email.com'
      },
      education_background: [
        {
          degree: 'Bachelor of Science',
          institution: 'University of Mumbai',
          year: 2022,
          gpa: 3.5
        }
      ],
      test_scores: {
        ielts: 7.5,
        gre: 320
      },
      preferred_countries: ['UK', 'USA', 'Canada'],
      preferred_levels: ['Masters', 'PhD'],
      preferred_disciplines: ['Computer Science', 'Data Science'],
      budget_range: {
        min: 20000,
        max: 40000,
        currency: 'USD'
      }
    }
  ];

  for (const profile of studentProfiles) {
    await prisma.apply_tenant_student_profiles.upsert({
      where: { user_id: profile.user_id },
      update: profile,
      create: profile
    });
  }

  console.log('✓ apply_tenant_student_profiles seeded successfully');
}

// 9. apply_tenant_universities seeds
async function seedUniversities() {
  console.log('Seeding apply_tenant_universities...');

  const universities = [
    {
      tenant_id: 1,
      name: 'University of London',
      slug: 'university-of-london',
      country_code: 'GB',
      state_code: 'ENG',
      city: 'London',
      address: 'Malet St, London WC1E 7HU, UK',
      website: 'https://www.london.ac.uk',
      contact_email: 'international@london.ac.uk',
      phone: '+44 20 7862 8000',
      description: 'A federal university comprising 17 constituent colleges.',
      logo: '/universities/uol-logo.png',
      is_active: true
    },
    {
      tenant_id: 1,
      name: 'University of Toronto',
      slug: 'university-of-toronto',
      country_code: 'CA',
      state_code: 'ON',
      city: 'Toronto',
      address: '27 King\'s College Cir, Toronto, ON M5S, Canada',
      website: 'https://www.utoronto.ca',
      contact_email: 'admissions@utoronto.ca',
      phone: '+1 416-978-2011',
      description: 'Public research university in Toronto, Ontario, Canada.',
      logo: '/universities/utoronto-logo.png',
      is_active: true
    }
  ];

  for (const university of universities) {
    await prisma.apply_tenant_universities.upsert({
      where: {
        tenant_id_slug: {
          tenant_id: university.tenant_id,
          slug: university.slug
        }
      },
      update: university,
      create: university
    });
  }

  console.log('✓ apply_tenant_universities seeded successfully');
}

// 10. apply_tenant_courses seeds
async function seedCourses() {
  console.log('Seeding apply_tenant_courses...');

  const courses = [
    {
      tenant_id: 1,
      university_id: 1,
      name: 'MSc Computer Science',
      slug: 'msc-computer-science',
      study_level: 'Masters',
      discipline: 'Computer Science',
      duration: '12 months',
      tuition_fee: {
        home: 15000,
        international: 25000,
        currency: 'GBP'
      },
      intake_dates: ['2024-09-01', '2025-01-15'],
      requirements: {
        degree: 'Bachelor in Computer Science or related field',
        gpa: 3.0,
        english_test: 'IELTS 6.5 or equivalent',
        prerequisites: ['Programming fundamentals', 'Data structures']
      },
      description: 'Advanced computer science program focusing on modern technologies.',
      is_active: true
    },
    {
      tenant_id: 1,
      university_id: 2,
      name: 'MBA Business Administration',
      slug: 'mba-business-administration',
      study_level: 'Masters',
      discipline: 'Business Administration',
      duration: '24 months',
      tuition_fee: {
        home: 35000,
        international: 65000,
        currency: 'CAD'
      },
      intake_dates: ['2024-09-01'],
      requirements: {
        degree: 'Bachelor degree',
        gpa: 3.2,
        work_experience: '2 years minimum',
        english_test: 'IELTS 7.0 or equivalent'
      },
      description: 'Comprehensive MBA program for future business leaders.',
      is_active: true
    }
  ];

  for (const course of courses) {
    await prisma.apply_tenant_courses.upsert({
      where: {
        tenant_id_university_id_slug: {
          tenant_id: course.tenant_id,
          university_id: course.university_id,
          slug: course.slug
        }
      },
      update: course,
      create: course
    });
  }

  console.log('✓ apply_tenant_courses seeded successfully');
}

// 11. apply_subscriptions seeds
async function seedSubscriptions() {
  console.log('Seeding apply_subscriptions...');

  const subscriptions = [
    {
      tenant_id: 1,
      plan_id: 2,
      activated_modules: {
        student_portal: true,
        agent_portal: true,
        staff_portal: true,
        admin_portal: true
      },
      status: 'ACTIVE' as const,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      is_auto_renew: true
    },
    {
      tenant_id: 2,
      plan_id: 1,
      activated_modules: {
        student_portal: true,
        agent_portal: false,
        staff_portal: true,
        admin_portal: true
      },
      status: 'ACTIVE' as const,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      is_auto_renew: true
    }
  ];

  for (const subscription of subscriptions) {
    await prisma.apply_subscriptions.upsert({
      where: {
        tenant_id_plan_id: {
          tenant_id: subscription.tenant_id,
          plan_id: subscription.plan_id
        }
      },
      update: subscription,
      create: subscription
    });
  }

  console.log('✓ apply_subscriptions seeded successfully');
}

// 12. apply_tenant_user_permissions seeds
async function seedUserPermissions() {
  console.log('Seeding apply_tenant_user_permissions...');

  const permissions = [
    // Staff user permissions
    {
      tenant_id: 1,
      user_id: 2,
      module: 'APPLICATIONS' as const,
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: false,
      can_manage: false
    },
    {
      tenant_id: 1,
      user_id: 2,
      module: 'STUDENTS' as const,
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: false,
      can_manage: false
    },
    {
      tenant_id: 1,
      user_id: 2,
      module: 'UNIVERSITIES' as const,
      can_view: true,
      can_create: false,
      can_edit: false,
      can_delete: false,
      can_manage: false
    }
  ];

  for (const permission of permissions) {
    await prisma.apply_tenant_user_permissions.upsert({
      where: {
        tenant_id_user_id_module: {
          tenant_id: permission.tenant_id,
          user_id: permission.user_id,
          module: permission.module
        }
      },
      update: permission,
      create: permission
    });
  }

  console.log('✓ apply_tenant_user_permissions seeded successfully');
}

// 13. apply_tenant_applications seeds
async function seedApplications() {
  console.log('Seeding apply_tenant_applications...');

  const applications = [
    {
      tenant_id: 1,
      student_id: 1,
      course_id: 1,
      intake_date: new Date('2024-09-01'),
      application_status: 'SUBMITTED' as const,
      application_fee_status: 'PAID' as const,
      assigned_staff_id: 2,
      submitted_at: new Date(),
      notes: {
        previous_education: 'Strong background in computer science',
        work_experience: '2 years as software developer'
      }
    },
    {
      tenant_id: 1,
      student_id: 1,
      course_id: 2,
      intake_date: new Date('2024-09-01'),
      application_status: 'DRAFT' as const,
      application_fee_status: 'PENDING' as const,
      notes: {
        interest: 'Interested in business management'
      }
    }
  ];

  for (const application of applications) {
    await prisma.apply_tenant_applications.upsert({
      where: {
        tenant_id_student_id_course_id_intake_date: {
          tenant_id: application.tenant_id,
          student_id: application.student_id,
          course_id: application.course_id,
          intake_date: application.intake_date
        }
      },
      update: application,
      create: application
    });
  }

  console.log('✓ apply_tenant_applications seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });