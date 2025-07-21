"use client"
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/admin');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10 relative z-10">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-2 text-center">Welcome Back</h1>
        <p className="text-blue-700 text-center mb-8">Login to your DoctorCare account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-blue-800 font-semibold mb-1">Email</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label htmlFor="password" className="block text-blue-800 font-semibold mb-1">Password</label>
            <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required className="w-full px-4 py-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold text-lg shadow hover:bg-blue-800 transition" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          {error && <p className="text-red-600 text-center mt-2">{error}</p>}
        </form>
        <p className="text-center text-blue-700 mt-6">Don&apos;t have an account? <Link href="/auth/register" className="underline font-semibold">Register</Link></p>
      </div>
    </section>
  );
}
