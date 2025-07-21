// app/auth/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="mt-4 text-gray-700">
        {error === 'CredentialsSignin' && 'Invalid email or password.'}
        {error === 'Configuration' && 'There is a problem with the server configuration.'}
        {error === 'AccessDenied' && 'Access denied.'}
        {!error && 'Unknown error occurred.'}
      </p>
    </div>
  );
}
