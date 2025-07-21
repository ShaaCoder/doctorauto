const services = [
  {
    title: 'Automated Scheduling',
    description: 'Patients book and manage appointments online. Automated reminders reduce no-shows.'
  },
  {
    title: 'Billing Automation',
    description: 'Generate invoices, process payments, and handle insurance claims with minimal effort.'
  },
  {
    title: 'Digital Patient Records',
    description: 'Access and update patient histories, notes, and documents securely from anywhere.'
  },
  {
    title: 'E-Prescriptions',
    description: 'Send prescriptions directly to pharmacies and track medication history.'
  },
  {
    title: 'Patient Portal',
    description: 'Give patients secure access to their records, appointments, and communication.'
  },
  {
    title: 'Analytics & Reporting',
    description: 'Gain insights into your practice with automated reports on appointments, revenue, and more.'
  },
];

const ServicesSection = () => (
  <section className="py-16 bg-white">
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Automation Services for Doctors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service) => (
          <div key={service.title} className="bg-blue-50 rounded-lg p-6 shadow text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{service.title}</h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection; 