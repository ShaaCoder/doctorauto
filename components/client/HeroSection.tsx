"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Health,
                <span className="text-blue-600 block">Our Priority</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Experience world-class healthcare with our comprehensive medical services. 
                Book appointments, manage prescriptions, and get expert care from the comfort of your home.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-gray-600">Expert Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image/Illustration */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Dr. Sarah Johnson</div>
                      <div className="text-sm text-gray-600">Cardiologist</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">Next available:</div>
                    <div className="text-sm font-medium text-blue-600">Today 2:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </section>
  );
};

export default HeroSection; 