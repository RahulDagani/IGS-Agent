import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { countrySchema } from './schemas';

// GET all countries for tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tenantId = 1; // Static for now, will be from session later

    const countries = await prisma.tech_countries.findMany({
      where: {
        tenant_id: tenantId,
        is_deleted: false,
        OR: [
          {
            country: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            country_slug: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const formattedCountries = countries.map(country => ({
      id: country.id,
      uuid: country.uuid,
      country: country.country,
      country_slug: country.country_slug,
      created_at: country.created_at.toISOString(),
      updated_at: country.updated_at.toISOString(),
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedCountries 
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}

// POST create new country
export async function POST(request: NextRequest) {
  try {
    const tenantId = 1; // Static for now
    const body = await request.json();

    // Validate request body
    const validation = countrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data', 
          details: validation.error.issues  
        },
        { status: 400 }
      );
    }

    const { country } = validation.data;
    const country_slug = generateSlug(country);

    // Check if country already exists for this tenant
    const existingCountry = await prisma.tech_countries.findFirst({
      where: {
        tenant_id: tenantId,
        country_slug,
        is_deleted: false,
      },
    });

    if (existingCountry) {
      return NextResponse.json(
        { success: false, error: 'Country already exists' },
        { status: 409 }
      );
    }

    // Create new country
    const newCountry = await prisma.tech_countries.create({
      data: {
        tenant_id: tenantId,
        country,
        country_slug,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: newCountry.id,
          uuid: newCountry.uuid,
          country: newCountry.country,
          country_slug: newCountry.country_slug,
          created_at: newCountry.created_at,
          updated_at: newCountry.updated_at,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create country' },
      { status: 500 }
    );
  }
}

function generateSlug(country: string): string {
  return country
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}