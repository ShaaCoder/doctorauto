"use client"
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center">
          <span className="text-blue-600 font-bold text-xl">DoctorCare</span>
        </Link>
        <div className="space-x-6 hidden md:flex">
          <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600">About</Link>
          <Link href="/services" className="text-gray-700 hover:text-blue-600">Services</Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
        </div>
        <div className="space-x-4 hidden md:flex">
          <Link href="/auth/login" className="px-4 py-2 rounded text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium transition">Login</Link>
          <Link href="/auth/register" className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 