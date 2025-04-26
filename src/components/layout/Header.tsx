
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { isAuthenticated, userData, logout, userRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getNavLinks = () => {
    if (!isAuthenticated) return [];

    switch (userRole) {
      case 'SUPER_ADMIN':
        return [
          { name: 'Dashboard', path: '/super-admin/dashboard' },
          { name: 'Organizations', path: '/super-admin/organizations' },
          { name: 'Products', path: '/super-admin/products' },
          { name: 'Orders', path: '/super-admin/orders' },
        ];
      case 'ORG_ADMIN':
        return [
          { name: 'Dashboard', path: '/org-admin/dashboard' },
          { name: 'Users', path: '/org-admin/users' },
          { name: 'Measurements', path: '/org-admin/measurements' },
          { name: 'Products', path: '/org-admin/products' },
          { name: 'Orders', path: '/org-admin/orders' },
        ];
      case 'INDIVIDUAL':
        return [
          { name: 'Dashboard', path: '/individual/dashboard' },
          { name: 'Measurements', path: '/individual/measurements' },
          { name: 'Products', path: '/individual/products' },
          { name: 'Orders', path: '/individual/orders' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm z-40 fixed top-0 left-0 right-0 transition-all duration-300">
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-brand-blue to-brand-dark rounded-full w-9 h-9 flex items-center justify-center text-white font-bold">
              NG
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-dark bg-clip-text text-transparent">Nandha<span className="font-semibold">Garments</span></span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8 ml-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium relative py-2 transition-colors",
                    location.pathname === link.path || location.pathname.startsWith(`${link.path}/`) 
                      ? "text-brand-blue after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-blue"
                      : "text-gray-600 hover:text-brand-blue"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* User Profile / Auth Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm hidden md:block text-gray-600">
                  Welcome, <span className="font-medium text-brand-black">{userData?.name}</span>
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full border border-gray-200 hover:bg-gray-100 hover:text-brand-blue">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-brand-blue" />
                      <span>My Account</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/${userRole?.toLowerCase().replace('_', '-')}/profile`} className="cursor-pointer w-full">
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 hover:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMobileMenu}
                    className="rounded-full border border-gray-200 hover:bg-gray-100 hover:text-brand-blue"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login/individual">
                  <Button variant="outline" className="text-brand-blue border-brand-blue hover:bg-brand-blue/5">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-brand-blue hover:bg-brand-dark shadow-button">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-3 bg-gray-50 px-4 py-3 rounded-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium py-2 px-3 rounded-md transition-colors",
                    location.pathname === link.path || location.pathname.startsWith(`${link.path}/`) 
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-gray-600 hover:bg-gray-100 hover:text-brand-blue"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
