
import React from 'react';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span className="text-sm">contact@nandhagarments.com</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm">+91 9876543210</span>
            </div>
          </div>
          
          <div>
            <Link to="/signup">
              <Button className="bg-brand-blue hover:bg-brand-dark">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} NandhaGarments. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
