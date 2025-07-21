"use client"
import { Calendar, Clock, Shield, Users, FileText, Smartphone } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Easy Appointment Booking",
      description: "Book appointments with your preferred doctors in just a few clicks. Available 24/7 for your convenience."
    },
    {
      icon: Clock,
      title: "Real-time Availability",
      description: "See real-time doctor availability and get instant confirmation for your appointments."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health information is protected with bank-level security and HIPAA compliance."
    },
    {
      icon: Users,
      title: "Expert Doctors",
      description: "Access to a network of qualified and experienced healthcare professionals across all specialties."
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Receive and manage your prescriptions digitally. No more paper prescriptions to lose."
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Access your healthcare on the go with our mobile app available for iOS and Android."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose DoctorCare?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to making healthcare accessible, convenient, and secure for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 