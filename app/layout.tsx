import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import NextAuthSessionProvider from './providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <Navbar />
          <main className="pt-16 min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
