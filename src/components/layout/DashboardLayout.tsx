
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} isMobileOpen={sidebarOpen} />
      
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
        
        <main className={cn(
          "flex-1 transition-all duration-200 ease-in-out p-4 md:p-6",
          isAuthenticated ? "md:ml-64" : ""
        )}>
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout;
