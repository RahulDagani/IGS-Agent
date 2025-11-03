// app/api/admin/sections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sections = await prisma.apply_role_fields_sections.findMany({
      where: { tenant_id: '1' },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, order } = body;

    const section = await prisma.apply_role_fields_sections.create({
      data: {
        tenant_id: '1',
        name,
        role,
        order: order || 0,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}