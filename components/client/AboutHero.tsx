"use client"

const AboutHero = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About DoctorCare
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make healthcare accessible, convenient, and personalized for everyone. 
            Our platform connects patients with world-class healthcare professionals, making quality care 
            available at your fingertips.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">2020</div>
            <div className="text-gray-600">Founded</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Expert Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Patients Served</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero; 