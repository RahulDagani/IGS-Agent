import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phoneNumber } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.apply_tenant_users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create agent user
    // For agents, we need to handle the tenant_id and agent_id appropriately
    // You might want to create a tenant first or use a default tenant
    const agentUser = await prisma.apply_tenant_users.create({
      data: {
        name,
        email,
        phone_number: phoneNumber,
        password: hashedPassword,
        role: 'agent',
        is_verified: false,
        is_allowed: true,
        // You'll need to set tenant_id appropriately - this depends on your tenant structure
        // For now, using a placeholder or you might want to create a tenant for each agent
        tenant_id: 1, // Replace with actual tenant logic
        agent_id: null, // Agents don't have a parent agent
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = agentUser;

    return NextResponse.json(
      { 
        message: 'Agent registered successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}