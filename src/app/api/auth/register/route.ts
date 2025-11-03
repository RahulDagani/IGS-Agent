// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, companyName, subdomain, email, password } = await request.json();

    // Validate required fields
    if (!name || !companyName || !subdomain || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.apply_tenants.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if subdomain already exists
    const existingSubdomain = await prisma.apply_tenants.findUnique({
      where: { subdomain },
    });

    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create tenant
    const tenant = await prisma.apply_tenants.create({
      data: {
        name,
        companyName,
        subdomain: subdomain.toLowerCase(),
        email,
        passwordHash,
      },
    });

    // Remove password hash from response
    const { passwordHash: _, ...tenantWithoutPassword } = tenant;

    return NextResponse.json(
      { 
        message: 'Registration successful', 
        tenant: tenantWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}