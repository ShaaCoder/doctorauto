import Link from 'next/link';

const CTASection = () => (
  <section className="py-20 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white text-center">
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-4xl font-extrabold mb-4 drop-shadow">Ready to automate your practice?</h2>
      <p className="mb-8 text-xl font-medium">Join DoctorCare and discover how automation can transform your workflow and patient care.</p>
      <Link href="/auth/register" className="inline-block bg-white text-blue-700 px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-100 transition focus:ring-4 focus:ring-blue-200 focus:outline-none animate-pulse">Get Started Free</Link>
    </div>
  </section>
);

export default CTASection; 