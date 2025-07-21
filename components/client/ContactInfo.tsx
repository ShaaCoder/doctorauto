"use client"
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

const ContactInfo = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      details: "+1 (555) 123-4567",
      description: "Available 24/7 for urgent medical inquiries"
    },
    {
      icon: Mail,
      title: "Email Support",
      details: "support@doctorcare.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      details: "Available on website",
      description: "Chat with our support team in real-time"
    },
    {
      icon: MapPin,
      title: "Main Office",
      details: "123 Healthcare Ave, Medical District, NY 10001",
      description: "Visit us for in-person consultations"
    }
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 8:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 6:00 PM" },
    { day: "Sunday", hours: "10:00 AM - 4:00 PM" },
    { day: "Emergency", hours: "24/7 Available" }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Contact Methods */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <method.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{method.title}</h4>
                  <p className="text-blue-600 font-medium">{method.details}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Office Hours */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Office Hours</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3">
              {officeHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{schedule.day}</span>
                  <span className="font-medium text-gray-900">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-red-800 mb-2">Emergency Care</h4>
          <p className="text-red-700 mb-3">
            For medical emergencies, please call 911 or visit your nearest emergency room immediately.
          </p>
          <p className="text-sm text-red-600">
            Our platform is not intended for emergency medical situations.
          </p>
        </div>

        {/* FAQ Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">Frequently Asked Questions</h4>
          <p className="text-blue-700 mb-3">
            Find quick answers to common questions about our services and platform.
          </p>
          <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
            View FAQ →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo; 