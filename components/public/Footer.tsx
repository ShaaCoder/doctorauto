"use client"
import Link from 'next/link';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">© {year} DoctorCare. All rights reserved.</p>
        <div className="space-x-4 mt-4 md:mt-0">
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/services" className="hover:underline">Services</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 