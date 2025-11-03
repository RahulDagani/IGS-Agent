// app/api/admin/sections/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
    const { id } = await params; // Await the params

  try {
    const body = await request.json();
    const { name, role, order } = body;

    const section = await prisma.apply_role_fields_sections.update({
      where: { id: id },
      data: {
        name,
        role,
        order,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update section' },
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
    await prisma.apply_role_fields_sections.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}