
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  toggleSidebar?: () => void;
  isMobileOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isMobileOpen }) => {
  const { isAuthenticated, userData, logout, userRole } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 z-10 sticky top-0">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center">
          {isAuthenticated && toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold text-brand-blue">Nandha</span>
            <span className="text-lg font-semibold text-brand-black">Garments</span>
          </Link>
        </div>

        {/* Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex space-x-6 ml-10 text-sm">
            {userRole === 'SUPER_ADMIN' && (
              <>
                <Link to="/super-admin/dashboard" className="interactive-link">Dashboard</Link>
                <Link to="/super-admin/organizations" className="interactive-link">Organizations</Link>
                <Link to="/super-admin/products" className="interactive-link">Products</Link>
                <Link to="/super-admin/orders" className="interactive-link">Orders</Link>
              </>
            )}
            {userRole === 'ORG_ADMIN' && (
              <>
                <Link to="/org-admin/dashboard" className="interactive-link">Dashboard</Link>
                <Link to="/org-admin/users" className="interactive-link">Users</Link>
                <Link to="/org-admin/measurements" className="interactive-link">Measurements</Link>
                <Link to="/org-admin/orders" className="interactive-link">Orders</Link>
              </>
            )}
            {userRole === 'INDIVIDUAL' && (
              <>
                <Link to="/individual/dashboard" className="interactive-link">Dashboard</Link>
                <Link to="/individual/measurements" className="interactive-link">My Measurements</Link>
                <Link to="/individual/products" className="interactive-link">Products</Link>
                <Link to="/individual/orders" className="interactive-link">My Orders</Link>
              </>
            )}
          </nav>
        )}

        {/* User Profile / Auth Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:block">
                Welcome, <span className="font-medium">{userData?.name}</span>
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${userRole?.toLowerCase().replace('_', '-')}/profile`} className="cursor-pointer w-full">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" className="text-brand-blue">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-brand-blue hover:bg-brand-dark">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
