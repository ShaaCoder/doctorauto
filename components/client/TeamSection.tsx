"use client"

const TeamSection = () => {
  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      bio: "Board-certified cardiologist with 15+ years of experience in digital health innovation.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      bio: "Former tech executive with expertise in healthcare technology and patient experience.",
      avatar: "MC"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Clinical Operations",
      bio: "Family medicine specialist passionate about making healthcare accessible to all communities.",
      avatar: "ER"
    },
    {
      name: "David Thompson",
      role: "Chief Executive Officer",
      bio: "Healthcare entrepreneur with a vision to transform patient care through technology.",
      avatar: "DT"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Leadership Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our experienced team of healthcare professionals and technology experts are dedicated 
            to revolutionizing the way healthcare is delivered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">
                  {member.avatar}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {member.name}
              </h3>
              <p className="text-blue-600 font-medium mb-4">
                {member.role}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection; 