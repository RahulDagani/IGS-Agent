import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find agent user by email
    const agentUser = await prisma.apply_tenant_users.findUnique({
      where: { email },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!agentUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is allowed to login
    if (!agentUser.is_allowed) {
      return NextResponse.json(
        { error: 'Your account has been disabled. Please contact administrator.' },
        { status: 401 }
      );
    }

    // Check if user is an agent (has agent role or is an agent user)
    const isAgent = agentUser.role === 'agent' || agentUser.agent_id !== null;
    
    if (!isAgent) {
      return NextResponse.json(
        { error: 'Access denied. Agent privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, agentUser.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    // if (!agentUser.is_verified) {
    //   return NextResponse.json(
    //     { error: 'Your account is not verified. Please contact administrator.' },
    //     { status: 401 }
    //   );
    // }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: agentUser.id,
        email: agentUser.email,
        name: agentUser.name,
        role: agentUser.role,
        tenantId: agentUser.tenant_id,
        agentId: agentUser.agent_id,
        isAgent: true
      },
      JWT_SECRET,
      { 
        expiresIn: rememberMe ? '30d' : '1d' 
      }
    );

    // Update last login timestamp (you might want to add this field to your schema)
    // await prisma.apply_tenant_users.update({
    //   where: { id: agentUser.id },
    //   data: { last_login_at: new Date() }
    // });

    // Remove password from response
    const { password: _, ...agentUserWithoutPassword } = agentUser;

    // Create response
    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        user: agentUserWithoutPassword,
        token
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('agent-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Agent login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}