import { CalendarCheck, FileText, CreditCard, Pill } from 'lucide-react';

const features = [
  {
    icon: CalendarCheck,
    title: 'Automated Scheduling',
    description: 'Let patients book and manage appointments online, reducing no-shows and admin work.'
  },
  {
    icon: CreditCard,
    title: 'Smart Billing',
    description: 'Automate invoicing, payments, and insurance claims with ease.'
  },
  {
    icon: FileText,
    title: 'Digital Patient Records',
    description: 'Securely store and access patient data, notes, and history from anywhere.'
  },
  {
    icon: Pill,
    title: 'E-Prescriptions',
    description: 'Send prescriptions directly to pharmacies and track medication history.'
  }
];

const FeaturesSection = () => (
  <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-extrabold mb-12 text-center text-blue-900">Automation Features for Modern Practices</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-100 group">
            <div className="bg-blue-100 group-hover:bg-blue-200 transition-colors w-16 h-16 flex items-center justify-center rounded-full mb-5 shadow">
              <feature.icon className="w-8 h-8 text-blue-700" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-blue-800">{feature.title}</h3>
            <p className="text-gray-700 font-medium">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection; 