"use client"
import { Stethoscope, Heart, Brain, Baby, Eye, Smile, Pill, Activity } from 'lucide-react';

const ServicesList = () => {
  const services = [
    {
      icon: Stethoscope,
      title: "Primary Care",
      description: "Comprehensive health check-ups, preventive care, and treatment for common illnesses.",
      features: ["Annual physicals", "Vaccinations", "Chronic disease management", "Health screenings"]
    },
    {
      icon: Heart,
      title: "Cardiology",
      description: "Expert care for heart health, including diagnosis and treatment of cardiovascular conditions.",
      features: ["Heart disease screening", "ECG monitoring", "Blood pressure management", "Cardiac consultations"]
    },
    {
      icon: Brain,
      title: "Neurology",
      description: "Specialized care for neurological disorders and brain health conditions.",
      features: ["Headache treatment", "Seizure management", "Memory assessments", "Neurological exams"]
    },
    {
      icon: Baby,
      title: "Pediatrics",
      description: "Comprehensive healthcare for children from birth through adolescence.",
      features: ["Well-child visits", "Immunizations", "Growth monitoring", "Behavioral health"]
    },
    {
      icon: Eye,
      title: "Ophthalmology",
      description: "Complete eye care services including vision correction and eye disease treatment.",
      features: ["Eye exams", "Glasses prescriptions", "Contact lens fitting", "Eye surgery consultations"]
    },
    {
      icon: Smile,
      title: "Dental Care",
      description: "Comprehensive dental services for optimal oral health and beautiful smiles.",
      features: ["Dental cleanings", "Cavity fillings", "Root canals", "Cosmetic dentistry"]
    },
    {
      icon: Pill,
      title: "Pharmacy Services",
      description: "Convenient prescription management and medication counseling.",
      features: ["Prescription filling", "Medication reviews", "Drug interactions", "Delivery service"]
    },
    {
      icon: Activity,
      title: "Physical Therapy",
      description: "Rehabilitation and physical therapy services for injury recovery and mobility improvement.",
      features: ["Injury rehabilitation", "Post-surgery recovery", "Pain management", "Mobility training"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <service.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesList; 