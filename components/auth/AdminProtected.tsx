'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading, wait

    if (status === 'unauthenticated' || !session) {
      router.push('/auth/login');
      return;
    }

    // Optional: Check if user has admin role (if you have role-based auth)
    // if (session.user?.role !== 'admin') {
    //   router.push('/auth/error?error=AccessDenied');
    //   return;
    // }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
} 