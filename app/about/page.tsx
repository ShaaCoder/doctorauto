import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';

export default function AboutPage() {
  return (
    <>
      <HeroSection title="About Us" subtitle="Learn more about DoctorCare and our mission to make healthcare accessible for everyone." ctaText="Contact Us" ctaHref="/contact" />
      <AboutSection />
    </>
  );
} 