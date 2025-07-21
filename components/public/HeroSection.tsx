"use client"
import Link from 'next/link';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

const HeroSection = ({
  title = 'Automate Your Practice. Focus on Care.',
  subtitle = 'DoctorCare streamlines appointments, billing, and patient management so you can spend more time with patients and less on paperwork.',
  ctaText = 'See How It Works',
  ctaHref = '/services',
}: HeroSectionProps) => {
  return (
    <section className="relative pt-32 pb-24 bg-gradient-to-br from-blue-600 via-blue-400 to-blue-200 text-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 left-0">
          <path fill="#fff" fillOpacity="0.7" d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,197.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="bg-white/80 rounded-2xl shadow-xl px-8 py-12 backdrop-blur-md">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 drop-shadow-lg">{title}</h1>
          <p className="text-2xl text-blue-800 mb-8 font-medium">{subtitle}</p>
          <Link href={ctaHref} className="inline-block bg-blue-700 text-white px-10 py-4 rounded-lg font-bold text-lg shadow hover:bg-blue-800 transition">{ctaText}</Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 