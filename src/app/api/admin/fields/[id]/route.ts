// app/api/admin/fields/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // Await the params
  try {
    const body = await request.json();
    const { 
      field_label, 
      field_type, 
      is_required, 
      order, 
      options 
    } = body;

    const field = await prisma.apply_role_field_definitions.update({
      where: { id: id },
      data: {
        field_label,
        field_type,
        is_required,
        order,
        options,
        updated_at: new Date(),
      },
      include: {
        section: true
      }
    });

    return NextResponse.json(field);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update field' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // Await the params

  try {
    await prisma.apply_role_field_definitions.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete field' },
      { status: 500 }
    );
  }
}