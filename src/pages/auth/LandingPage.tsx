
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold text-brand-blue">Nandha</span>
            <span className="text-xl font-semibold text-brand-black">Garments</span>
          </div>
          <div>
            <Link to="/login/super-admin">
              <Button variant="ghost" className="text-sm text-gray-600">
                Super Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Welcome to <span className="text-brand-blue">Nandha Garments</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Streamlined garment management for organizations and individuals
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-4xl mx-auto">
            <Card className="w-full md:w-1/2 card-hover">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-brand-blue bg-opacity-10 p-3 rounded-full">
                    <Building2 size={24} className="text-brand-blue" />
                  </div>
                </div>
                <CardTitle className="text-center">Business & Organizations</CardTitle>
                <CardDescription className="text-center">
                  Manage multiple users, orders, and measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Corporate uniform management</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Bulk ordering</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Employee measurement tracking</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Custom uniforms and branding</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link to="/login/org-admin">
                  <Button className="w-full bg-brand-blue hover:bg-brand-dark">
                    Organization Login
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="w-full md:w-1/2 card-hover">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-brand-blue bg-opacity-10 p-3 rounded-full">
                    <User size={24} className="text-brand-blue" />
                  </div>
                </div>
                <CardTitle className="text-center">Individual Customers</CardTitle>
                <CardDescription className="text-center">
                  Manage your personal measurements and orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Personal measurement profile</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Custom clothing orders</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Order history and tracking</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mr-2"></div>
                    <span>Style preferences</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center space-x-4">
                <Link to="/login/individual" className="w-1/2">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" className="w-1/2">
                  <Button className="w-full bg-brand-blue hover:bg-brand-dark">
                    Sign up
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} NandhaGarments. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
