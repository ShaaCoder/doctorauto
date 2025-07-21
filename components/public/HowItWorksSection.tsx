import { Settings, Zap, Smile } from 'lucide-react';

const steps = [
  {
    icon: Settings,
    title: 'Set Up Your Practice',
    description: 'Easily onboard your clinic, add staff, and configure your services.'
  },
  {
    icon: Zap,
    title: 'Automate Your Workflow',
    description: 'Let DoctorCare handle scheduling, billing, and records while you focus on care.'
  },
  {
    icon: Smile,
    title: 'Grow Patient Satisfaction',
    description: 'Deliver a seamless experience that keeps patients coming back.'
  }
];

const HowItWorksSection = () => (
  <section className="py-20 bg-blue-50">
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-extrabold mb-12 text-center text-blue-900">How DoctorCare Works for Doctors</h2>
      <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-0">
        {steps.map((step, idx) => (
          <div key={step.title} className="flex-1 flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border border-blue-100 relative z-10 mx-2">
            <div className="bg-blue-600 text-white w-14 h-14 flex items-center justify-center rounded-full mb-4 text-2xl font-bold shadow-lg border-4 border-blue-200">
              {idx + 1}
            </div>
            <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <step.icon className="w-7 h-7 text-blue-700" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-blue-800">{step.title}</h3>
            <p className="text-gray-700 font-medium">{step.description}</p>
          </div>
        ))}
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-blue-200 z-0" style={{top: '60px'}} />
      </div>
    </div>
  </section>
);

export default HowItWorksSection; 