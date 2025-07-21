"use client"
import { Heart, Shield, Users, Zap } from 'lucide-react';

const MissionSection = () => {
  const values = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Every decision we make is focused on improving patient outcomes and experience."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We maintain the highest standards of data security and patient privacy."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Making quality healthcare available to everyone, regardless of location or circumstance."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously improving our platform with cutting-edge technology and best practices."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission & Values
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              At DoctorCare, we believe that everyone deserves access to quality healthcare. 
              Our mission is to bridge the gap between patients and healthcare providers through 
              innovative technology and compassionate care.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We're committed to creating a healthcare ecosystem that's not just efficient, 
              but also human-centered, ensuring that every patient feels heard, cared for, 
              and supported throughout their healthcare journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection; 