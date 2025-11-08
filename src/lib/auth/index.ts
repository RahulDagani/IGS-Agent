// lib/auth/index.ts
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  tenant_id: number;
  agent_id?: number;
  is_verified: boolean;
  is_allowed: boolean;
}

export interface SessionPayload extends Record<string, string | number | undefined> {
  userId: number;
  email: string;
  name: string;
  role: string;
  tenantId: number;
  agentId?: number;
  type: 'admin' | 'user';
}

interface AdminUser {
  id: number;
  email: string;
  company_name: string;
  password_hash: string;
  status: string;
}

interface TenantUser {
  id: number;
  email: string;
  password: string;
  role: string;
  agent_id?: number;
  is_allowed: boolean;
}

export class AuthService {
  // Unified login method
  static async login(
    email: string, 
    password: string, 
    userType: 'admin' | 'agent'
  ): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> {
    try {
      let user: AuthUser | null = null;
      let userTypeFound: 'admin' | 'user' = 'user';

      // Try admin login first
      if (userType === 'admin') {
        const adminUser = await prisma.apply_tenants.findUnique({
          where: { email },
        }) as AdminUser | null;

        if (adminUser) {
          userTypeFound = 'admin';
          
          // Check tenant status
          if (adminUser.status !== 'ACTIVE') {
            return { success: false, error: 'Your tenant account is not active' };
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
          if (!isValidPassword) {
            return { success: false, error: 'Invalid credentials' };
          }

          // Transform admin user to AuthUser format
          user = {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.company_name,
            role: 'admin',
            tenant_id: adminUser.id, // Admin's tenant_id is their own id
            is_verified: true,
            is_allowed: true,
          };
        }
      }

      // If not admin or admin not found, try tenant user
      if (userType === 'agent') {
        const tenantUser = await prisma.apply_tenant_users.findUnique({
          where: { email },
        }) as TenantUser | null;

        if (tenantUser) {
          userTypeFound = 'user';
          
          // Check if user is allowed to login
          if (!tenantUser.is_allowed) {
            return { success: false, error: 'Your account has been disabled' };
          }

          // For agent login, verify role
          if (userType === 'agent' && tenantUser.role !== 'agent' && !tenantUser.agent_id) {
            return { success: false, error: 'Agent privileges required' };
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, tenantUser.password);
          if (!isValidPassword) {
            return { success: false, error: 'Invalid credentials' };
          }

          user = {
            id: tenantUser.id,
            email: tenantUser.email,
            name: tenantUser.email, // Using email as name since name field is not available
            role: tenantUser.role,
            tenant_id: 0, // This should be populated from tenant relationship
            agent_id: tenantUser.agent_id,
            is_verified: true,
            is_allowed: tenantUser.is_allowed,
          };
        }
      }

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate JWT token
      const token = await this.generateToken(user, userTypeFound);

      return { 
        success: true, 
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  private static async generateToken(user: AuthUser, type: 'admin' | 'user'): Promise<string> {
    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenant_id,
      type: type,
    };

    if (user.agent_id) {
      payload.agentId = user.agent_id;
    }

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(type === 'admin' ? '30d' : '7d')
      .sign(JWT_SECRET);
  }

  // Verify token and get user
  static async verifyToken(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Validate and cast the payload safely
      if (
        payload &&
        typeof payload === 'object' &&
        'userId' in payload &&
        'email' in payload &&
        'name' in payload &&
        'role' in payload &&
        'tenantId' in payload &&
        'type' in payload
      ) {
        return {
          userId: Number(payload.userId),
          email: String(payload.email),
          name: String(payload.name),
          role: String(payload.role),
          tenantId: Number(payload.tenantId),
          agentId: payload.agentId ? Number(payload.agentId) : undefined,
          type: payload.type as 'admin' | 'user',
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get current user from request
  static async getCurrentUser(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    return this.verifyToken(token);
  }

  // Password utilities
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}