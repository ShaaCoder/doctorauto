const testimonials = [
  {
    name: 'Dr. Sarah J.',
    text: 'DoctorCare automation cut my admin time in half. Now I can focus on my patients, not paperwork.'
  },
  {
    name: 'Dr. Michael C.',
    text: 'Billing and scheduling are now effortless. My staff and patients both love the new workflow.'
  },
  {
    name: 'Dr. Emily R.',
    text: 'E-prescriptions and digital records have made my practice more efficient and secure.'
  }
];

const TestimonialsSection = () => (
  <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-extrabold mb-12 text-center text-blue-900">What Doctors Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-white rounded-2xl p-8 shadow-xl text-center flex flex-col items-center border border-blue-100">
            <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700 mb-4 shadow">
              {t.name.split(' ').map(w => w[0]).join('')}
            </div>
            <p className="text-gray-700 mb-4 italic">"{t.text}"</p>
            <div className="font-semibold text-blue-700">{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection; 