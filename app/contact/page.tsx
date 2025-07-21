import HeroSection from '@/components/public/HeroSection';
import ContactSection from '@/components/public/ContactSection';

export default function ContactPage() {
  return (
    <>
      <HeroSection title="Contact Us" subtitle="Have questions or need help? Reach out to our team and we'll get back to you soon." ctaText="Email Us" ctaHref="mailto:support@doctorcare.com" />
      <ContactSection />
    </>
  );
} 