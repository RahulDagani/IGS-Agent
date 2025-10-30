import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { countrySchema } from '../schemas';

// GET single country
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = 1; // Static for now
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country ID' },
        { status: 400 }
      );
    }

    const country = await prisma.tech_countries.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        is_deleted: false,
      },
    });

    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: country.id,
        uuid: country.uuid,
        country: country.country,
        country_slug: country.country_slug,
        created_at: country.created_at,
        updated_at: country.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch country' },
      { status: 500 }
    );
  }
}

// PUT update country
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = 1; // Static for now
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country ID' },
        { status: 400 }
      );
    }

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

    // Check if country exists and belongs to tenant
    const existingCountry = await prisma.tech_countries.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        is_deleted: false,
      },
    });

    if (!existingCountry) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    // Check if another country with same slug exists
    const duplicateCountry = await prisma.tech_countries.findFirst({
      where: {
        tenant_id: tenantId,
        country_slug,
        is_deleted: false,
        NOT: { id },
      },
    });

    if (duplicateCountry) {
      return NextResponse.json(
        { success: false, error: 'Country already exists' },
        { status: 409 }
      );
    }

    // Update country
    const updatedCountry = await prisma.tech_countries.update({
      where: { id },
      data: {
        country,
        country_slug,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCountry.id,
        uuid: updatedCountry.uuid,
        country: updatedCountry.country,
        country_slug: updatedCountry.country_slug,
        created_at: updatedCountry.created_at,
        updated_at: updatedCountry.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update country' },
      { status: 500 }
    );
  }
}

// DELETE country (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = 1; // Static for now
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country ID' },
        { status: 400 }
      );
    }

    // Check if country exists and belongs to tenant
    const existingCountry = await prisma.tech_countries.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        is_deleted: false,
      },
    });

    if (!existingCountry) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    // Soft delete the country
    await prisma.tech_countries.update({
      where: { id },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Country deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete country' },
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