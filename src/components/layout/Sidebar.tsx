
import React from 'react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, Users, Ruler, ShoppingBag, 
  ClipboardList, Settings, Building2, 
  FileText, LayoutDashboard, User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, end = false }) => {
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-brand-blue text-white" 
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { userRole, userData } = useAuth();

  let sidebarContent;
  
  if (userRole === 'SUPER_ADMIN') {
    sidebarContent = (
      <nav className="space-y-2 px-4 py-4">
        <SidebarLink 
          to="/super-admin/dashboard" 
          icon={<LayoutDashboard size={18} />} 
          label="Dashboard" 
        />
        <SidebarLink 
          to="/super-admin/organizations" 
          icon={<Building2 size={18} />} 
          label="Organizations" 
        />
        <SidebarLink 
          to="/super-admin/individual-users" 
          icon={<User size={18} />} 
          label="Individual Users" 
        />
        <SidebarLink 
          to="/super-admin/products" 
          icon={<ShoppingBag size={18} />} 
          label="Products" 
        />
        <SidebarLink 
          to="/super-admin/orders" 
          icon={<ClipboardList size={18} />} 
          label="Orders" 
        />
        <SidebarLink 
          to="/super-admin/profile" 
          icon={<Settings size={18} />} 
          label="Settings" 
        />
      </nav>
    );
  } else if (userRole === 'ORG_ADMIN') {
    sidebarContent = (
      <nav className="space-y-2 px-4 py-4">
        <SidebarLink 
          to="/org-admin/dashboard" 
          icon={<LayoutDashboard size={18} />} 
          label="Dashboard" 
        />
        <SidebarLink 
          to="/org-admin/users" 
          icon={<Users size={18} />} 
          label="Users" 
        />
        <SidebarLink 
          to="/org-admin/measurements" 
          icon={<Ruler size={18} />} 
          label="Measurements" 
        />
        <SidebarLink 
          to="/org-admin/products" 
          icon={<ShoppingBag size={18} />}
          label="Products" 
        />
        <SidebarLink 
          to="/org-admin/orders" 
          icon={<ClipboardList size={18} />}
          label="Orders" 
        />
        <SidebarLink 
          to="/org-admin/profile" 
          icon={<Settings size={18} />}
          label="Settings" 
        />
      </nav>
    );
  } else if (userRole === 'INDIVIDUAL') {
    sidebarContent = (
      <nav className="space-y-2 px-4 py-4">
        <SidebarLink 
          to="/individual/dashboard" 
          icon={<Home size={18} />} 
          label="Dashboard" 
          end 
        />
        <SidebarLink 
          to="/individual/measurements" 
          icon={<Ruler size={18} />} 
          label="My Measurements" 
        />
        <SidebarLink 
          to="/individual/products" 
          icon={<ShoppingBag size={18} />} 
          label="Products" 
        />
        <SidebarLink 
          to="/individual/orders" 
          icon={<ClipboardList size={18} />} 
          label="My Orders" 
        />
        <SidebarLink 
          to="/individual/profile" 
          icon={<User size={18} />} 
          label="My Profile" 
        />
      </nav>
    );
  } else {
    sidebarContent = <div className="px-4 py-4">No navigation available</div>;
  }

  // User info section
  const userInfo = userData ? (
    <div className="px-4 py-3 border-t border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="rounded-full bg-brand-blue w-8 h-8 flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {userData.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium truncate">{userData.name}</p>
          <p className="text-xs text-gray-500 truncate">{userData.email}</p>
        </div>
      </div>
      {userData.org_name && (
        <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded">
          <span className="font-medium">Organization:</span> {userData.org_name}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out",
          isOpen ? "transform-none" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-brand-blue">Nandha</span>
            <span className="font-semibold text-brand-black">Garments</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        
        {userInfo}
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
