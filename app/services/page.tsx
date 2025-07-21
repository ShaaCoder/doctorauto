import HeroSection from '@/components/public/HeroSection';
import ServicesSection from '@/components/public/ServicesSection';

export default function ServicesPage() {
  return (
    <>
      <HeroSection title="Our Services" subtitle="Explore the range of healthcare services we offer to keep you and your family healthy." ctaText="Get Started" ctaHref="/signup" />
      <ServicesSection />
    </>
  );
} 