
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 pt-24">
        <div className="container mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout;
