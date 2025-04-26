
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'sonner';

export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'INDIVIDUAL' | null;

interface UserData {
  id: string;
  name: string;
  email: string;
  org_id?: string;
  org_name?: string;
  is_first_login?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: UserRole;
  userData: UserData | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const storedUserRole = localStorage.getItem('userRole') as UserRole;
      const storedUserData = localStorage.getItem('userData');
      
      if (token && storedUserRole && storedUserData) {
        setIsAuthenticated(true);
        setUserRole(storedUserRole);
        setUserData(JSON.parse(storedUserData));
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      let response;
      
      if (role === 'SUPER_ADMIN') {
        response = await authService.loginSuperAdmin({ email, password });
        if (response.data.success) {
          localStorage.setItem('userData', JSON.stringify(response.data.admin));
        }
      } else if (role === 'ORG_ADMIN') {
        response = await authService.loginOrgAdmin({ email, password });
        if (response.data.success) {
          localStorage.setItem('userData', JSON.stringify(response.data.admin));
        }
      } else if (role === 'INDIVIDUAL') {
        response = await authService.loginIndividual({ email, password });
        if (response.data.success) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      } else {
        throw new Error('Invalid role');
      }
      
      // Check response and update state
      if (response && response.data.success) {
        // For simplicity, we're assuming the token would be in the response
        // In a real app, you would get an actual token from the backend
        const fakeToken = `fake-token-${Date.now()}`;
        localStorage.setItem('authToken', fakeToken);
        localStorage.setItem('userRole', role);
        
        setIsAuthenticated(true);
        setUserRole(role);
        
        // Set user data based on role
        if (role === 'SUPER_ADMIN') {
          setUserData(response.data.admin);
          
          // Check if first login and redirect to password reset if needed
          if (response.data.admin.is_first_login) {
            navigate('/reset-password');
          } else {
            navigate('/super-admin/dashboard');
          }
        } else if (role === 'ORG_ADMIN') {
          setUserData(response.data.admin);
          
          if (response.data.admin.is_first_login) {
            navigate('/reset-password');
          } else {
            navigate('/org-admin/dashboard');
          }
        } else {
          setUserData(response.data.user);
          navigate('/individual/dashboard');
        }
        
        toast.success('Logged in successfully');
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
    navigate('/login');
    toast.info('Logged out successfully');
  };

  const resetPassword = async (email: string, newPassword: string) => {
    if (!userRole) {
      toast.error('User role not found');
      return;
    }
    
    try {
      const userType = userRole.toLowerCase().replace('_', '');
      const response = await authService.resetPassword({
        user_type: userType,
        email,
        new_password: newPassword,
      });
      
      if (response.data.success) {
        toast.success('Password reset successfully');
        
        // Update user data to reflect that it's no longer first login
        if (userData) {
          const updatedUserData = { ...userData, is_first_login: false };
          setUserData(updatedUserData);
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
        }
        
        // Redirect based on user role
        if (userRole === 'SUPER_ADMIN') {
          navigate('/super-admin/dashboard');
        } else if (userRole === 'ORG_ADMIN') {
          navigate('/org-admin/dashboard');
        } else {
          navigate('/individual/dashboard');
        }
      } else {
        toast.error('Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password');
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    userRole,
    userData,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
