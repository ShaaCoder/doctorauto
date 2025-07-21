"use client"
import Link from 'next/link';
import ClientSignupForm from '@/components/signup/ClientSignupForm';

export default function RegisterPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10 relative z-10">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-2 text-center">Create Your DoctorCare Account</h1>
        <p className="text-blue-700 text-center mb-8">Automate your practice. Start for free.</p>
        <ClientSignupForm />
        <p className="text-center text-blue-700 mt-6">Already have an account? <Link href="/auth/login" className="underline font-semibold">Login</Link></p>
      </div>
    </section>
  );
}
