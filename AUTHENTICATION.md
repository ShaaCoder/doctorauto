# Authentication System for Admin Pages

This document explains how authentication is implemented for the admin pages in the clinic management system.

## Overview

The admin pages are protected using a multi-layered authentication approach:

1. **Server-side Middleware Protection** - Route-level protection
2. **Client-side Component Protection** - UI-level protection with loading states
3. **Session Management** - NextAuth.js integration

## How It Works

### 1. Middleware Protection (`middleware.ts`)

The middleware intercepts all requests to `/admin/*` routes and:
- Checks if the user has a valid session token
- Redirects unauthenticated users to `/auth/login`
- Allows authenticated users to proceed

### 2. AdminProtected Component (`components/auth/AdminProtected.tsx`)

This component wraps all admin pages and provides:
- Session checking using `useSession()` hook
- Loading states while checking authentication
- Automatic redirect to login if not authenticated
- Clean UI rendering only for authenticated users

### 3. Protected Admin Pages

All admin pages are now wrapped with the `AdminProtected` component:

- `/admin/page.tsx` - Main dashboard
- `/admin/patients/page.tsx` - Patient management
- `/admin/appointments/page.tsx` - Appointment management
- `/admin/prescriptions/page.tsx` - Prescription management
- `/admin/billing/page.tsx` - Billing management

## Authentication Flow

1. **Unauthenticated User** tries to access `/admin/*`
2. **Middleware** intercepts and redirects to `/auth/login`
3. **User logs in** with valid credentials
4. **NextAuth** creates a session
5. **User is redirected** to `/admin` dashboard
6. **AdminProtected component** verifies session and renders content

## Login Process

1. User visits `/auth/login`
2. Enters email and password
3. Credentials are validated against the database
4. If valid, a session is created
5. User is redirected to `/admin` dashboard

## Session Management

- Sessions are managed by NextAuth.js
- JWT strategy is used for session tokens
- Sessions persist across browser sessions
- Automatic session refresh

## Security Features

- **Route Protection**: Server-side middleware prevents direct access
- **Component Protection**: Client-side checks ensure UI security
- **Session Validation**: Real-time session checking
- **Automatic Redirects**: Seamless user experience
- **Loading States**: Professional UX during authentication checks

## Adding New Protected Pages

To protect a new admin page:

1. Import the `AdminProtected` component:
```tsx
import AdminProtected from '@/components/auth/AdminProtected';
```

2. Wrap your page content:
```tsx
export default function NewAdminPage() {
  return (
    <AdminProtected>
      {/* Your page content */}
    </AdminProtected>
  );
}
```

3. The middleware will automatically protect the route if it's under `/admin/*`

## Role-Based Access (Future Enhancement)

The system is prepared for role-based access control. To implement:

1. Add a `role` field to the User model
2. Uncomment and modify the role check in `AdminProtected.tsx`
3. Update the middleware to check user roles
4. Add role checks in the auth callbacks

## Environment Variables

Ensure these environment variables are set:
- `NEXTAUTH_SECRET` - Secret key for JWT tokens
- `NEXTAUTH_URL` - Your application URL

## Testing Authentication

1. Try accessing `/admin` without logging in - should redirect to login
2. Log in with valid credentials - should access admin dashboard
3. Try accessing other admin pages - should work seamlessly
4. Log out and try accessing admin pages - should redirect to login 