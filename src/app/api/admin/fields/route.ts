// app/api/admin/fields/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fields = await prisma.apply_role_field_definitions.findMany({
      where: { tenant_id: '1' },
      include: {
        section: true
      },
      orderBy: [{ section_id: 'asc' }, { order: 'asc' }]
    });

    return NextResponse.json(fields);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch fields' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      section_id, 
      role, 
      field_name, 
      field_label, 
      field_type, 
      is_required, 
      order, 
      options 
    } = body;

    const field = await prisma.apply_role_field_definitions.create({
      data: {
        tenant_id: '1',
        section_id,
        role,
        field_name,
        field_label,
        field_type,
        is_required: is_required || false,
        order: order || 0,
        options: options || null,
      },
      include: {
        section: true
      }
    });

    return NextResponse.json(field);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create field' },
      { status: 500 }
    );
  }
}