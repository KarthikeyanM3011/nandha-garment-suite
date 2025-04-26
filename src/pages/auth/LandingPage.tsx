
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, User, ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 shadow-sm py-4 px-4">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-brand-blue to-brand-dark rounded-full w-9 h-9 flex items-center justify-center text-white font-bold">
              NG
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-dark bg-clip-text text-transparent ml-2">Nandha<span className="font-semibold">Garments</span></span>
          </div>
          <div>
            <Link to="/login/super-admin">
              <Button variant="ghost" className="text-sm text-gray-600 hover:text-brand-blue">
                Super Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2 space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Welcome to <span className="bg-gradient-to-r from-brand-blue to-brand-dark bg-clip-text text-transparent">NandhaGarments</span>
                </h1>
                <p className="text-xl text-gray-700 max-w-xl">
                  Streamlined garment management for organizations and individuals. 
                  From measurements to ordering, we've got you covered.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/login/org-admin">
                    <Button className="w-full sm:w-auto px-8 py-6 text-base bg-brand-blue hover:bg-brand-dark transition-all duration-200 shadow-button">
                      <Building2 className="mr-2 h-5 w-5" />
                      Organization Login
                    </Button>
                  </Link>
                  <Link to="/login/individual">
                    <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-base border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5 transition-all duration-200">
                      <User className="mr-2 h-5 w-5" />
                      Individual Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -top-6 -left-6 w-full h-full rounded-xl bg-brand-blue/20 -z-10"></div>
                  <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-blue to-brand-dark flex items-center justify-center overflow-hidden shadow-xl">
                    <div className="text-6xl md:text-7xl font-bold text-white/90">Nandha</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                We offer comprehensive solutions for both organizations and individuals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Business Card */}
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="bg-brand-blue/10 text-brand-blue p-3 rounded-lg">
                    <Building2 size={28} />
                  </div>
                  <h3 className="text-2xl font-bold ml-4 text-gray-800 group-hover:text-brand-blue transition-colors">Business & Organizations</h3>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Corporate uniform management with easy organization-wide access</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Bulk ordering for your entire team with centralized billing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Employee measurement tracking with custom profiles for each team member</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Custom uniforms and branding options to match your company's identity</span>
                  </li>
                </ul>
                
                <Link to="/login/org-admin" className="inline-flex items-center text-brand-blue font-medium hover:underline group">
                  Organization Login
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Individual Card */}
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="bg-brand-blue/10 text-brand-blue p-3 rounded-lg">
                    <User size={28} />
                  </div>
                  <h3 className="text-2xl font-bold ml-4 text-gray-800 group-hover:text-brand-blue transition-colors">Individual Customers</h3>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Personal measurement profile that saves your exact specifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Custom clothing orders tailored to your personal measurements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Order history and tracking to monitor your purchases</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Style preferences saved for future orders and recommendations</span>
                  </li>
                </ul>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <Link to="/login/individual" className="inline-flex items-center text-brand-blue font-medium hover:underline group">
                    Log in
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link to="/signup" className="inline-flex items-center text-brand-blue font-medium hover:underline group">
                    Sign up
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="bg-gradient-to-r from-brand-blue to-brand-dark rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-12 text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-lg text-white/90 max-w-lg mb-8">
                  Join NandhaGarments today and experience the convenience of digital garment management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login/org-admin">
                    <Button className="w-full sm:w-auto bg-white text-brand-blue hover:bg-gray-100 border-2 border-white transition-all duration-200 px-6 py-5">
                      <Building2 className="mr-2 h-5 w-5" />
                      For Organizations
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline" className="w-full sm:w-auto border-2 border-white bg-transparent text-white hover:bg-white/10 transition-all duration-200 px-6 py-5">
                      <User className="mr-2 h-5 w-5" />
                      For Individuals
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-6 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-brand-blue to-brand-dark rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
              NG
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-blue to-brand-dark bg-clip-text text-transparent ml-2">Nandha<span className="font-semibold">Garments</span></span>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Email: contact@nandhagarments.com | Phone: +91 9876543210
          </p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} NandhaGarments. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
