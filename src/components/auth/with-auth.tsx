// components/auth/with-auth.tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionPayload } from '@/lib/auth';

// Base props that all wrapped components should accept
interface WithAuthBaseProps {
  children?: ReactNode;
}

// The user prop that will be injected
interface WithAuthInjectedProps {
  user: SessionPayload;
}

// Combined props for the wrapped component
type WithAuthProps<T extends WithAuthBaseProps = WithAuthBaseProps> = T & WithAuthBaseProps & WithAuthInjectedProps;

export function withAuth<
  T extends WithAuthBaseProps = WithAuthBaseProps
>(
  WrappedComponent: React.ComponentType<WithAuthProps<T>>,
  allowedRoles?: string[],
  allowedUserTypes?: ('admin' | 'user')[]
) {
  // Return component props without the injected 'user' prop
  type ComponentProps = Omit<T, keyof WithAuthInjectedProps>;
  
  return function AuthenticatedComponent(props: ComponentProps & { children?: ReactNode }) {
    const [user, setUser] = useState<SessionPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const { user: userData } = await response.json();

        // Check role access
        if (allowedRoles && !allowedRoles.includes(userData.role)) {
          router.push('/unauthorized');
          return;
        }

        // Check user type access
        if (allowedUserTypes && !allowedUserTypes.includes(userData.type)) {
          router.push('/unauthorized');
          return;
        }

        setUser(userData);
      } catch (error) {
        const loginPath = pathname.startsWith('/partner') ? '/agent-login' : '/signin';
        router.push(`${loginPath}?callbackUrl=${encodeURIComponent(pathname)}`);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    // Combine props with the injected user prop
    const combinedProps = {
      ...props,
      user,
    } as WithAuthProps<T>;

    return <WrappedComponent {...combinedProps} />;
  };
}